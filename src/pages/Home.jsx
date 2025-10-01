import React, { useEffect, useState, useContext, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { getConcerts } from "../api/concertsApi";

import Globe from "../components/Globe";
import Stats from "../components/Stats";
import Filters from "../components/Filters";
import EventCard from "../components/EventCard";
import Popup from "../components/Popup";
import BackgroundParticles from "../components/BackgroundParticles";

import { AppContext } from "../context/AppContext";

export default function Home(){
  const [events, setEvents] = useState([]);
  const [continent, setContinent] = useState("");
  const [artist, setArtist] = useState("");
  const [selected, setSelected] = useState(null);
  const [globeActive, setGlobeActive] = useState(false);
  const { liked } = useContext(AppContext);
  const wsRef = useRef(null);

  useEffect(() => {
    // Fetch concerts from backend API
    (async ()=> {
      let lat, lng;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {}
      }
      let data = await getConcerts();
      setEvents(data);
    })();

    // WebSocket for real-time updates
    wsRef.current = new window.WebSocket("ws://localhost:4000");
    wsRef.current.onmessage = (msg) => {
      try {
        let data = JSON.parse(msg.data);
        if (data.type === "concerts-update" && Array.isArray(data.concerts)) {
          setEvents(data.concerts);
        }
      } catch {}
    };
    wsRef.current.onclose = () => { wsRef.current = null; };
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  // filters
  const filtered = events.filter(e => {
    const cOK = !continent || e.continent === continent;
    const aOK = !artist || e.artist.toLowerCase().includes(artist.toLowerCase());
    return cOK && aOK;
  });

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <BackgroundParticles id="home-bg" />
      
      <div style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <Canvas style={{ width: '100vw', height: '100vh' }}>
          <Stars radius={100} depth={100} count={1000} factor={1} fade />
        </Canvas>
      </div>
      <main className="main-container" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <section className="top-section">
          <Stats events={filtered} liked={liked} />
          <Filters events={events} continent={continent} setContinent={setContinent} artist={artist} setArtist={setArtist} />
        </section>

        <section className="globe-section">
            <Globe
              events={filtered}
              onMarkerClick={(e) => {
                if (e) setSelected(e);
              }}
              onGlobeMouseDown={() => setGlobeActive(true)}
              onGlobeMouseUp={() => setGlobeActive(false)}
            />
        </section>

        <section className="cards-section" style={{marginTop: 32}}>
          <h2 style={{marginBottom: 16}}>All Events</h2>
          {events.length === 0 ? (
            <p className="muted">No events found.</p>
          ) : (
            events.map(ev => (
              <div className="event-card" key={ev.id}>
                <h3 style={{fontWeight: 700, fontSize: '1.2rem', color: '#1a5cff'}}>{ev.artist}</h3>
                <div style={{fontWeight: 600, fontSize: '1.05rem'}}><b>Venue:</b> {ev.venue}</div>
                <div style={{fontWeight: 600, fontSize: '1.05rem'}}><b>Date:</b> {ev.date}</div>
                <div style={{color: '#6a7a8c', fontSize: '0.98rem'}}><b>City:</b> {ev.city}, <b>Country:</b> {ev.country}</div>
                <div style={{color: '#6a7a8c', fontSize: '0.98rem'}}><b>Genre:</b> {ev.genre}</div>
                <div style={{marginTop: 8}}>
                  <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer" className="btn">Tickets</a>
                </div>
              </div>
            ))
          )}
        </section>

        {selected && <Popup concert={selected} onClose={() => {
          setSelected(null);
          setGlobeActive(false);
        }} />}
      </main>
    </div>
  );
}
