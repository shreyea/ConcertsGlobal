import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";


export default function EventCard({ event, onOpen }) {

  // Like functionality disabled (backend required)
  const [isLiked] = React.useState(event.liked || false);
  function handleLike() {
    alert('Login and backend required to like events.');
  }

  return (
    <article className="event-card">
      <div className="event-top">
        <h3>{event.name}</h3>
        <div className="event-meta">{event.artist} • {event.city} • {event.date}</div>
      </div>
      <div className="event-actions">
        <button className="btn" onClick={() => onOpen(event)}>Details</button>
        <button className={`btn btn-${isLiked ? 'liked' : 'like'}`} onClick={handleLike}>
          {isLiked ? "Liked" : "Like"}
        </button>
      </div>
    </article>
  );
}
