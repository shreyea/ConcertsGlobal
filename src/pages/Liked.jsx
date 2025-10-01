import React from "react";
import { Link } from "react-router-dom";
import BackgroundParticles from "../components/BackgroundParticles";

export default function Liked() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundParticles />
      <div className="page" style={{ position: 'relative', zIndex: 1 }}>
        <h2>Liked Events</h2>
        <Link to="/" className="btn btn-primary" style={{marginBottom:16, display:'inline-block'}}>Explore</Link>
        <div className="cards-grid">
          <p className="muted">Liked events require login and backend support.</p>
        </div>
      </div>
    </div>
  );
}
