import React, { useEffect, useState } from "react";
// import EventCard from "../components/EventCard";
import BackgroundParticles from "../components/BackgroundParticles";
import { getConcerts } from "../api/concertsApi";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [pos, setPos] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        getConcerts().then(data => {
          setEvents(data);
          setPos({ lat, lng });
        });
      },
      () => {
        getConcerts().then(data => {
          setEvents(data);
        });
      }
    );
  }, []);

  useEffect(() => {
    if (events.length === 0) return;
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < events.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 180); // 180ms gap between cards
    return () => clearInterval(interval);
  }, [events]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundParticles />
      <div className="page" style={{ position: 'relative', zIndex: 1 }}>
        <h2>All Events</h2>
        {!pos && <p className="muted">Location unavailable or blocked. Distance will not be shown.</p>}
        <div className="cards-grid">
          {events.length === 0 ? (
            <p className="muted">No events found.</p>
          ) : (
            events.map((ev, idx) => {
              const isVisible = idx < visibleCount;
              return (
                <div
                  className="event-card"
                  key={ev.id}
                >
                  <h3>{ev.artist}</h3>
                  <div><b>Venue:</b> {ev.venue}</div>
                  <div><b>City:</b> {ev.city}, <b>Country:</b> {ev.country}</div>
                  <div><b>Date:</b> {ev.date}</div>
                  <div><b>Genre:</b> {ev.genre}</div>
                  <div>
                    <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer" className="btn">Tickets</a>
                  </div>
                  {pos && typeof ev.lat === 'number' && typeof ev.lng === 'number' && (
                    <p style={{ color: '#9aa6b2', fontSize: '0.95rem' }}>
                      {distanceKm(pos.lat, pos.lng, ev.lat, ev.lng).toFixed(1)} km away
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
