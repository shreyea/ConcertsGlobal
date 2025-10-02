import React, { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

export default function EventCard({ event, onOpen,style }) {
  const { liked, toggleLike, notify, getEventKey } = useContext(AppContext);
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
        <h3>{event.name}</h3>
        <div className="event-meta">{event.artist} • {event.city} • {event.date}</div>
        {typeof event.distanceKm === 'number' && (
          <div className="event-distance muted">{event.distanceKm.toFixed(1)} km away</div>
        )}
      </div>
      <div className="event-actions">
        <button className="btn" onClick={() => { if (typeof onOpen === 'function') onOpen(event); }}>Details</button>
        <button className="btn btn-plan" onClick={() => { window.open(event.tickets || '#', '_blank'); }}>Plan</button>
        <button className={`btn ${isTracked ? 'btn-tracked' : 'btn-track'}`} onClick={handleTrack}>
          {isTracked ? "Tracking" : "Track"}
        </button>
      </div>
    </article>
  );
}
