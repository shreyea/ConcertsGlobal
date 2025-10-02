import React, { useEffect, useState } from "react";
import BackgroundParticles from "../components/BackgroundParticles";
import { getConcerts } from "../api/concertsApi";
import EventCard from "../components/EventCard";


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
      setAll(data);
    });
  }, []);

  useEffect(()=> {
    if (!pos || !all.length) return;
    const res = all.filter(e => {
      if (typeof e.lat !== 'number' || typeof e.lng !== 'number') return false;
      return distanceKm(pos.lat, pos.lng, e.lat, e.lng) <= 50; // within 50 km as requested
    }).map(e => ({ ...e, distanceKm: distanceKm(pos.lat, pos.lng, e.lat, e.lng) }));
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
    <div className="page-root page-around-me" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundParticles />
      <div className="around-me" style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '40px 24px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ margin: 0 }}>Events Around Me</h2>
          <div className="badge-container" style={{ display: 'flex', gap: 8 }}>
            <div className="planned-badge" >📌 Planned</div>
            <div className="find-badge">🔎 Find</div>
          </div>
        </div>
        {!pos ? (
          <p className="muted" style={{ marginBottom: 24 }}>Location unavailable or blocked.</p>
        ) : (
          <p className="muted" style={{ marginBottom: 24 }}>
            Your location: {pos.lat.toFixed(3)}, {pos.lng.toFixed(3)}
          </p>
        )}
        <div className="cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 24 }}>
          {nearby.length ? nearby.slice(0, visibleCount).map((ev, idx) => (
            <div className="ae" key={ev.id} style={{ animationDelay: `${idx * 100}ms` }}>
              <EventCard event={ev} onOpen={() => {}} />
            </div>
          )) : (
            <p className="muted" style={{ gridColumn: '1/-1', textAlign: 'center' }}>No nearby events found within 50 km.</p>
          )}
        </div>
      </div>
    </div>
  );
}
