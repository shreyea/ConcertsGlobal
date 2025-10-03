import React from 'react';

export default function ProfessionalSection({ className = '' }) {
  return (
    <section className={`professional-section ${className}`} aria-labelledby="professional-heading">
      <div className="professional-inner">
        <div className="prof-col">
          <h4 id="professional-heading"><a href="/about">About</a></h4>
          <p>Concerts Global is a discovery platform for live music. We aggregate event data, surface local shows, and help fans connect with artists worldwide. Our mission is to make live music easier to find and share.</p>
        </div>

        <div className="prof-col">
          <h4>Team</h4>
          <p>We’re a small multidisciplinary team of designers, engineers and music lovers. We're focused on building delightful tools for discovering and attending live events.</p>
        </div>

        <div className="prof-col">
          <h4>Careers</h4>
          <p>Looking to join us? We value curiosity, humility, and a passion for live experiences. Email <a href="mailto:careers@concertsglobal.example">careers@concertsglobal.example</a> with a short note and your resume.</p>
        </div>

        <div className="prof-col">
          <h4>Press Kit</h4>
          <p>Press assets, logos, and brand guidelines are available on request. <a href="/press-kit" aria-label="Press kit">Download the press kit</a>.</p>
        </div>

        <div className="prof-col">
          <h4>Contact</h4>
          <p>General inquiries: <a href="mailto:shreyaupadhayay13@gmail.com">shreyaupadhayay13@gmail.com</a></p>
          <p>Twitter: <a href="https://twitter.com/ConcertsGlobal" target="_blank" rel="noreferrer">@ConcertsGlobal</a></p>
        </div>

        <div className="prof-col">
          <h4>Support</h4>
          <p>Need help? Visit our <a href="/support" aria-label="Support">support center</a> for FAQs, troubleshooting, and ticketing info.</p>
        </div>
      </div>
    </section>
  );
}
