import React, { useContext } from "react";
import { Link } from "react-router-dom";
import BackgroundParticles from "../components/BackgroundParticles";
import { AppContext } from "../context/AppContext";

export default function Tracked() {
  const { tracked, liked, toggleLike, getEventKey } = useContext(AppContext);
  const items = Array.isArray(tracked) ? tracked : (Array.isArray(liked) ? liked : []);

  // optional debug display for event keys
  const showKeys = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('SHOW_EVENT_KEYS') === '1';

  return (
    <div className="page-root page-tracked" style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <BackgroundParticles />
  <div className="around-me" style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 24px 24px 24px' }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "1rem" }}>Tracked Events</h2>
        <Link to="/" className="find-badge" style={{ marginBottom: 20 }}>
          Explore
        </Link>

        <div className="cards-section">
          {items.length === 0 ? (
            <p className="muted">No tracked events yet.</p>
          ) : (
            items.map((ev) => {
              const key = getEventKey ? getEventKey(ev) : (ev._id || ev.id || `${ev.name}::${ev.city}::${ev.date}`);
              return (
                <div key={key} className={`event-card stat-card`}> 
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="event-title">{ev.name || ev.artist || "Event"}</h3>
                    <span className="tracked-badge">Tracked</span>
                  </div>
                  <div className="event-meta"><b>Artist:</b> {ev.artist || "TBA"}</div>
                  <div className="event-meta"><b>Date:</b> {ev.date || "TBA"}</div>
                  <div className="event-meta"><b>City:</b> {ev.city || "TBA"}{ev.country ? `, ${ev.country}` : ''}</div>
                  {ev.genre && <div className="event-meta"><b>Genre:</b> {ev.genre}</div>}

                  {showKeys && <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Key: {key}</div>}

                  <div style={{ marginTop: 12 }} className="event-actions">
                    <button
                      className="btn btn-tracked"
                      onClick={() => toggleLike(ev)}
                    >
                      Untrack
                    </button>
                    <a
                      href={ev.ticket_url || ev.tickets || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      🎟 Tickets
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
