import React, { useContext } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

export default function Popup({ concert, onClose }) {
  const { liked, toggleLike, notify } = useContext(AppContext);
  
  // Safety check for concert object
  if (!concert) return null;
  
  const { getEventKey } = useContext(AppContext);
  const key = getEventKey ? getEventKey(concert) : (concert?.id || concert?._id || `${concert.name}::${concert.city}::${concert.date}`);
  const isTracked = Array.isArray(liked) && liked.some(e => {
    try { return (getEventKey ? getEventKey(e) : (e?.id || e?._id || `${e.name}::${e.city}::${e.date}`)) === key; } catch { return false; }
  });
  
  const handleTrackClick = () => {
    try {
  const wasTracked = isTracked;
      toggleLike(concert);
      const name = concert.name || concert.artist || 'Event';
      if (!wasTracked) notify?.(`Added "${name}" to Tracked`);
      else notify?.(`Removed "${name}" from Tracked`);
    } catch (err) {
      console.error('Error tracking concert:', err);
    }
  };

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-card" onClick={(e)=>e.stopPropagation()}>
        <h2>{concert.name || 'Event'}</h2>
        <p className="muted">
          <FaMapMarkerAlt /> 
          {[concert.city, concert.country].filter(Boolean).join(', ') || 'Location TBA'}
        </p>
        <p>{concert.date || 'Date TBA'}</p>
        <div className="popup-actions">
          <a 
            className="btn btn-primary" 
            href={concert.tickets || "#"} 
            target="_blank" 
            rel="noreferrer"
          >
            Tickets
          </a>
          <button 
            className={`btn ${isTracked ? 'btn-tracked' : 'btn-track'}`} 
            onClick={handleTrackClick}
          >
            {isTracked ? "Tracking" : "Track"}
          </button>
        </div>
        <button className="popup-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
