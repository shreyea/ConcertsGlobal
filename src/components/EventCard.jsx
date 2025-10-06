import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt, FaInfoCircle } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

export default function EventCard({ event, onOpen,style }) {
  const navigate = useNavigate();
  const { liked, toggleLike, notify, getEventKey, setActivePlan } = useContext(AppContext);
  const key = getEventKey ? getEventKey(event) : (event?._id || event?.id || `${event.name}::${event.city}::${event.date}`);
  const isTracked = useMemo(() => Array.isArray(liked) && liked.some(e => {
    try { return (getEventKey ? getEventKey(e) : (e?._id || e?.id || `${e.name}::${e.city}::${e.date}`)) === key; } catch { return false; }
  }), [liked, key, getEventKey]);

  function handleTrack() {
    // Frontend-only tracking: no login required
    if (!event) return;
    try {
      const wasTracked = isTracked;
      toggleLike(event);
      const name = event.name || event.artist || 'Event';
      if (!wasTracked) notify?.(`Added "${name}" to Tracked`);
      else notify?.(`Removed "${name}" from Tracked`);
    } catch (err) {
      console.error('Track toggle failed:', err);
    }
  }

  return (
    <article className={`event-card ${isTracked ? 'liked' : ''}`.trim()} style={style}>
      <div className="event-top">
        <div>
          <h3>{event.name}</h3>
          {/* Show artist and date on one line, and city on the next line (use event.city from concerts.json) */}
          <div className="event-meta">{event.artist || ''}{event.date ? ` • ${event.date}` : ''}</div>
          <div className="event-location muted">{event.city || 'TBA'}</div>
          {typeof event.distanceKm === 'number' && (
            <div className="event-distance muted">{event.distanceKm.toFixed(1)} km away</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {/* Save button removed as requested */}
        </div>
      </div>
      <div className="event-actions">
        <button className="btn btn-details" onClick={() => { if (typeof onOpen === 'function') onOpen(event); }}>Details</button>
  <button className="btn btn-plan" onClick={() => { try { setActivePlan({ event, budget: 100, transport: 'car', seatingPref: 'standard', numPeople: 1 }); } catch {} navigate('/plan', { state: { event } }); }}>Plan</button>
        <button className={`btn ${isTracked ? 'btn-tracked' : 'btn-track'}`} onClick={handleTrack}>
          {isTracked ? "Tracking" : "Track"}
        </button>
      </div>
    </article>
  );
}

// Inject navigate hook after component declared to keep top-level hooks consistent
