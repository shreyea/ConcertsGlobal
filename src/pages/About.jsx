import React from 'react';
import BackgroundParticles from '../components/BackgroundParticles';

export default function About() {
  return (
    <div className="page page-about container-medium">
      <BackgroundParticles />

      <header className="about-hero">
        <h1>About Concerts Global</h1>
        <p>We make it effortless for music fans to discover great live shows—nearby and around the world.</p>
      </header>

      <section className="about-mission">
        <h2>Our mission</h2>
        <p>We help fans discover meaningful live experiences by combining reliable event data, clear design, and privacy-first practices—making discovery fast, local, and delightful.</p>
      </section>

      <section className="about-story">
        <h2>Our story</h2>
        <p>What started as a frustration with scattered listings became a focused effort: centralize event information and make discovery visual and intuitive. We surface local gigs, tour routes, and curated recommendations so fans can explore with confidence.</p>
        <p>Our map and globe views are built to inspire exploration—whether you’re planning a night out or following a favorite act on tour.</p>
      </section>

      <section className="about-founder">
        <h2>Founder</h2>
        <div className="founder-row">
          <div className="founder-photo" aria-hidden>SG</div>
          <div>
            <h3>Shreya — Founder &amp; CEO</h3>
            <p>Engineer, designer. Shreya built Concerts Global to bridge discovery and attendance so artists and fans connect more easily.</p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Work with us</h2>
        <p>We're hiring and partnering with people who care about live music. Email <a href="mailto:careers@concertsglobal.example">careers@concertsglobal.example</a> to get in touch.</p>
      </section>
    </div>
  );
}
