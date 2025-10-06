import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import BackgroundParticles from "../components/BackgroundParticles";
import { getConcerts } from "../api/concertsApi";
import EventCard from "../components/EventCard";


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
  const { liked, toggleLike, notify, getEventKey } = useContext(AppContext);

  useEffect(() => {
    // Fetch concerts from backend API
    let lat, lng;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        lat = p.coords.latitude;
        lng = p.coords.longitude;
        getConcerts(lat, lng).then(data => {
          data = (data || []).map(c => ({
            id: c._id || c.apiId,
            artist: Array.isArray(c.artists) ? c.artists.join(', ') : (c.artist || ''),
            name: c.name,
            city: c.city || c.location || '',
            country: '',
            continent: '',
            lat: c.lat,
            lng: c.lng,
            date: c.date ? new Date(c.date).toLocaleDateString() : '',
            isLive: true,
            tickets: '#',
          }));
          setEvents(data);
          setPos({ lat, lng });
        });
      },
      () => {
        getConcerts().then(data => {
          data = (data || []).map(c => ({
            id: c._id || c.apiId,
            artist: Array.isArray(c.artists) ? c.artists.join(', ') : (c.artist || ''),
            name: c.name,
            city: c.location || '',
            country: '',
            continent: '',
            lat: c.lat,
            lng: c.lng,
            date: c.date ? new Date(c.date).toLocaleDateString() : '',
            isLive: true,
            tickets: '#',
          }));
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
    <div className="page-root page-all-events" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundParticles />
  <div className="page all-events" style={{ position: 'relative', zIndex: 1 }}>
        <h2>All Events</h2>
        {!pos && <p className="muted">Location unavailable or blocked. Distance will not be shown.</p>}
        <div className="cards-grid">
          {events.length === 0 ? (
            <p className="muted">No events found.</p>
          ) : (
            events.map((ev, idx) => {
              const isVisible = idx < visibleCount;
              const dist = (pos && typeof ev.lat === 'number' && typeof ev.lng === 'number') ? distanceKm(pos.lat, pos.lng, ev.lat, ev.lng) : null;
              return (
                <div className="ae" key={ev.id} >
                  <EventCard event={{...ev, distanceKm: dist}} onOpen={() => { /* open popup could be wired here */ }} style={{ animationDelay: `${idx * 100}ms` }} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
