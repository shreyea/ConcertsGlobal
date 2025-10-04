import React from 'react';
import ContactForm from '../components/ContactForm';
import BackgroundParticles from '../components/BackgroundParticles';

export default function Support(){
  return (
    <div className="page page-support page-container">
      <BackgroundParticles />
      <div className="support-grid support-grid-inner">
        <div>
          <h1>Support</h1>
          <p>Browse our FAQs or send us a message — we aim to respond within 48 hours.</p>

          <h3>FAQs</h3>
          <h4>How do I add an event?</h4>
          <p>We ingest data from multiple partners. If you'd like an event added or corrected, please include full details via the contact form.</p>

          <h4>How do I report an issue?</h4>
          <p>Use the contact form to provide a clear description and screenshots where possible. That helps us triage quickly.</p>
        </div>

        <aside>
          <h3>Contact us</h3>
          <ContactForm defaultSubject="Support request" />
        </aside>
      </div>
    </div>
  );
}
