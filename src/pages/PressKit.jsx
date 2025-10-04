import React from 'react';
import BackgroundParticles from '../components/BackgroundParticles';

export default function PressKit() {
  return (
    <div className="page page-press page-container">
      <BackgroundParticles />
      <div className="container-medium">
        <h1>Press Kit</h1>
        <p>Resources for media and partners: logos, brand guidelines, and company background.</p>

        <h3>What's included</h3>
        <ul>
          <li>Logos (SVG and PNG)</li>
          <li>Brand color palette &amp; usage guidelines</li>
          <li>Company one-pager</li>
          <li>High-resolution screenshots</li>
        </ul>

        <p><a href="/assets/press/ConcertsGlobal-PressKit.zip">Download the full Press Kit (ZIP)</a></p>

        <h3>Media inquiries</h3>
        <p>For interviews or additional materials, contact <a href="mailto:press@concertsglobal.example">press@concertsglobal.example</a>.</p>
      </div>
    </div>
  );
}
