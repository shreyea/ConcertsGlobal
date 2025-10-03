import React from 'react';

export default function About(){
  return (
    <div className="page page-about container-medium">
      <header className="about-hero">
        <h1>About Concerts Global</h1>
        <p className="muted">Building better music discovery for live audiences worldwide.</p>
      </header>

      <section className="about-mission">
        <h2>Our mission</h2>
        <p className="muted">We believe live music brings people together. Our mission is to make it effortless for fans to discover live shows, support artists, and build community. We combine curated data, thoughtful design, and privacy-first practices to deliver a delightful discovery experience.</p>
      </section>

      <section className="about-story">
        <h2>Our story</h2>
        <p className="muted">Concerts Global started as a small side project by concert-goers frustrated with fragmented ticket listings and inconsistent discovery tools. Over time it became a focused effort to centralize event information, add locality features, and help fans find shows they care about.</p>
        <p className="muted">We build with real music fans in mind—keeping interactions simple, fast, and respectful of user data. Our public map and globe views are designed to inspire exploration, whether you're planning a weekend night out or tracking touring bands across continents.</p>
      </section>

      <section className="about-founder">
        <h2>Founder</h2>
        <div className="founder-row">
          <div className="founder-photo">S</div>
          <div>
            <h3>Shreya (Founder)</h3>
            <p className="muted">Engineer, product designer, and lifelong music fan. Built Concerts Global to bridge gaps between discovery and attendance, and to help artists reach fans more easily.</p>
          </div>
        </div>
      </section>

    

      <section className="about-cta">
        <h2>Work with us</h2>
        <p className="muted">We're hiring and partnering with people who care about live music. Email <a href="mailto:careers@concertsglobal.example">careers@concertsglobal.example</a> to get in touch.</p>
      </section>
    </div>
  );
}
