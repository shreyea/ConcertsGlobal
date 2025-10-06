import React, { useContext } from "react";
import { Link } from "react-router-dom";
import BackgroundParticles from "../components/BackgroundParticles";
import EventCard from "../components/EventCard";
import Popup from "../components/Popup";
import { AppContext } from "../context/AppContext";

export default function Tracked() {
  const { tracked, liked, toggleLike, getEventKey } = useContext(AppContext);
  const [selected, setSelected] = React.useState(null);
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
              // Render the shared EventCard component which already provides Details, Plan, Track
              return (
                <div key={key} className="stat-card" style={{ width: '100%' }}>
                  <EventCard
                    event={ev}
                    onOpen={(e) => setSelected(e)}
                    style={{ marginBottom: 12 }}
                  />
                
                  {showKeys && <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Key: {key}</div>}
                </div>
              );
            })
          )}
        </div>
        {selected && <Popup concert={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
