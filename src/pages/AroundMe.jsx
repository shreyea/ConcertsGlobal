import React, { useEffect, useState } from "react";

import BackgroundParticles from "../components/BackgroundParticles";
import { getConcerts } from "../api/concertsApi";


function distanceKm(lat1, lon1, lat2, lon2){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export default function AroundMe(){
  const [pos, setPos] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [all, setAll] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(()=> {
    navigator.geolocation.getCurrentPosition((p)=> setPos({lat:p.coords.latitude, lng:p.coords.longitude}), ()=> setPos(null));
    getConcerts().then(data => {
  // Use the API data as-is for now
  setAll(data);
    });
  }, []);

  useEffect(()=> {
    if (!pos || !all.length) return;
    const res = all.filter(e => {
      if (typeof e.lat !== 'number' || typeof e.lng !== 'number') return false;
      return distanceKm(pos.lat, pos.lng, e.lat, e.lng) < 500; // within 500 km
    });
    setNearby(res);
  }, [pos, all]);

  useEffect(() => {
    if (nearby.length === 0) return;
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < nearby.length) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [nearby]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundParticles />
      <div className="page" style={{ position: 'relative', zIndex: 1 }}>
        <h2>📍 Events Around Me</h2>
        {!pos ? <p className="muted">Location unavailable or blocked.</p> : <p className="muted">Your location: {pos.lat.toFixed(3)}, {pos.lng.toFixed(3)}</p>}
        <div className="cards-grid">
          {nearby.length ? nearby.slice(0, visibleCount).map(ev => (
            <div className="event-card" key={ev.id}>
              <h3>{ev.artist}</h3>
              <div><b>Venue:</b> {ev.venue}</div>
              <div><b>City:</b> {ev.city}, <b>Country:</b> {ev.country}</div>
              <div><b>Date:</b> {ev.date}</div>
              <div><b>Genre:</b> {ev.genre}</div>
              <div>
                <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer" className="btn">Tickets</a>
              </div>
            </div>
          )) : <p className="muted">No nearby events found.</p>}
        </div>
      </div>
    </div>
  );
}
