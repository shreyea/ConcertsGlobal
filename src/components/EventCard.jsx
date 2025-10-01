import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { likeConcert } from '../api/concertsApi';

export default function EventCard({ event, onOpen }) {
  const token = localStorage.getItem('token');
  const [isTracked, setIsTracked] = React.useState(event.liked || false);

  async function handleTrack() {
    if (!token) return alert('Login required to track events');
    const res = await likeConcert(event._id || event.id, token);
    if (res.success) setIsTracked(true);
  }

  return (
    <article className="event-card">
      <div className="event-top">
        <h3>{event.name}</h3>
        <div className="event-meta">{event.artist} • {event.city} • {event.date}</div>
      </div>
      <div className="event-actions">
        <button className="btn" onClick={() => onOpen(event)}>Details</button>
        <button className={`btn btn-${isTracked ? 'tracked' : 'track'}`} onClick={handleTrack}>
          {isTracked ? "Tracking" : "Track"}
        </button>
      </div>
    </article>
  );
}
