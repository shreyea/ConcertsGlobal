import React, { useContext } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

export default function Popup({ concert, onClose }) {
  const { liked, toggleLike } = useContext(AppContext);
  if (!concert) return null;
  const isTracked = liked.some(e => e.id === concert.id);

  return (
    <div className="popup-backdrop" onClick={onClose}>
      <div className="popup-card" onClick={(e)=>e.stopPropagation()}>
        <h2>{concert.name}</h2>
        <p className="muted"><FaMapMarkerAlt /> {concert.city}, {concert.country}</p>
        <p>{concert.date}</p>
        <div className="popup-actions">
          <a className="btn btn-primary" href={concert.tickets || "#"} target="_blank" rel="noreferrer">Tickets</a>
          <button className={`btn ${isTracked ? 'btn-tracked' : 'btn-track'}`} onClick={() => toggleLike(concert)}>
            {isTracked ? "Tracking" : "Track"}
          </button>
        </div>
        <button className="popup-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
