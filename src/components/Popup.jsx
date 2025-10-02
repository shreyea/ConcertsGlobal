import React, { useContext } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

export default function Popup({ concert, onClose }) {
  const { liked, toggleLike } = useContext(AppContext);
  
  // Safety check for concert object
  if (!concert) return null;
  
  const isTracked = Array.isArray(liked) && liked.some(e => e && e.id === concert.id);
  
  const handleTrackClick = () => {
    try {
      toggleLike(concert);
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
