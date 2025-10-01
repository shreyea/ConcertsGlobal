import React, { useEffect, useState } from "react";
// import EventCard from "../components/EventCard";
import BackgroundParticles from "../components/BackgroundParticles";
import { getConcerts } from "../api/concertsApi";

export default function LiveEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConcerts()
      .then((data) => {
        setEvents((data || []).filter((ev) => ev.isLive !== false));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <BackgroundParticles id="live-bg" />

      <div
        className="page"
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 800,
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: 16 }}>Live Events</h2>

        {loading ? (
          <p className="muted">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="muted">No live events found.</p>
        ) : (
          <div className="cards-grid">
            {events.map((ev, idx) => (
              <div
                key={ev.id}
                className="event-card"
                style={{
                  animationDelay: `${idx * 180}ms`,
                }}
              >
                <h3>{ev.artist}</h3>
                <div><b>Venue:</b> {ev.venue}</div>
                <div><b>City:</b> {ev.city}, <b>Country:</b> {ev.country}</div>
                <div><b>Date:</b> {ev.date}</div>
                <div><b>Genre:</b> {ev.genre}</div>
                <div>
                  <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer" className="btn">Tickets</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
