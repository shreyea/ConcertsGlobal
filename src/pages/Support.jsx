import React from 'react';
import ContactForm from '../components/ContactForm';

export default function Support(){
  return (
    <div className="page page-support page-container">
      <div className="support-grid support-grid-inner">
        <div>
          <h1>Support</h1>
          <p className="muted">Browse FAQs or send us a message. We aim to respond within 48 hours.</p>

          <h3>FAQs</h3>
          <h4>How do I add an event?</h4>
          <p className="muted">We ingest data from multiple providers; if you'd like an event added or corrected, please send details via the contact form.</p>

          <h4>How do I report an issue?</h4>
          <p className="muted">Use the contact form to provide a description and screenshots where possible.</p>
        </div>

        <aside>
          <h3>Contact us</h3>
          <ContactForm defaultSubject="Support request" />
        </aside>
      </div>
    </div>
  );
}
