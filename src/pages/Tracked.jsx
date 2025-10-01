import React, { useContext } from "react";
import { Link } from "react-router-dom";
import BackgroundParticles from "../components/BackgroundParticles";
import { AppContext } from "../context/AppContext";

export default function Tracked() {
  const { tracked } = useContext(AppContext);

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <BackgroundParticles />
      <div className="page" style={{ position: "relative", zIndex: 1, padding: "2rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "1rem" }}>Tracked Events</h2>
        <Link to="/" className="btn btn-primary" style={{ marginBottom: 24, display: "inline-block" }}>
          Explore
        </Link>

        <div className="cards-section">
          {tracked.length === 0 ? (
            <p className="muted">No tracked events yet.</p>
          ) : (
            tracked.map((ev) => (
              <div className="event-card stat-card" key={ev.id}>
                <h3 className="event-title">{ev.artist}</h3>
                <div className="event-meta"><b>Venue:</b> {ev.venue}</div>
                <div className="event-meta"><b>Date:</b> {ev.date}</div>
                <div className="event-meta"><b>City:</b> {ev.city}, <b>Country:</b> {ev.country}</div>
                <div className="event-meta"><b>Genre:</b> {ev.genre}</div>
                <div style={{ marginTop: 12 }}>
                  <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer" className="btn">
                    🎟 Tickets
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
