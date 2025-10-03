import React, { useState } from 'react';

export default function ContactForm({ defaultSubject = '', onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !message) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    // simulate an async request (mock endpoint)
    setTimeout(() => {
      setStatus('success');
      setName(''); setEmail(''); setSubject(defaultSubject); setMessage('');
      if (onSuccess) onSuccess();
      console.debug('[ContactForm] simulated submit', { name, email, subject, message });
    }, 800);
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} aria-live="polite">
      <div className="field-row">
        <label>Name (optional)
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
        </label>
        <label>Email*
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@domain.com" required />
        </label>
      </div>
      <label>Subject
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" />
      </label>
      <label>Message*
        <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="How can we help?" required rows={6} />
      </label>

      <div className="contact-form-actions">
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send Message'}</button>
        {status === 'success' && <span className="muted">Thanks — we received your message.</span>}
        {status === 'error' && <span className="muted form-error">Please provide an email and message.</span>}
      </div>
    </form>
  );
}
