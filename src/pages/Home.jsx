import React, { useEffect, useState, useContext, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { getConcerts } from "../api/concertsApi"; // Note: exported name getConcerts in your version
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
      let data = await getConcerts(lat, lng);
      // Map backend concert data to frontend format
      data = (data || []).map(c => ({
        id: c._id || c.apiId,
        artist: Array.isArray(c.artists) ? c.artists.join(', ') : (c.artist || ''),
        name: c.name,
        city: c.location || '',
        country: '', // Ticketmaster API does not provide country directly
        continent: '', // Optionally map based on location/country
        lat: c.lat,
        lng: c.lng,
        date: c.date ? new Date(c.date).toLocaleDateString() : '',
        isLive: true, // Assume all are live for now
        tickets: '#', // Optionally add ticket URL
      }));
      setEvents(data);
    })();

    // WebSocket for real-time updates
    wsRef.current = new window.WebSocket("ws://localhost:4000");
    wsRef.current.onmessage = (msg) => {
      try {
        let data = JSON.parse(msg.data);
        if (data.type === "concerts-update" && Array.isArray(data.concerts)) {
          // Map backend concert data to frontend format
          data = data.concerts.map(c => ({
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

        <section className={`top-section ${globeActive ? 'fade-out' : ''}`}>
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
              isActive={globeActive}
            />
        </section>

        <section className={`cards-section${globeActive ? " fade-out" : ""}`}>
          {filtered.map(ev => <EventCard key={ev.id} event={ev} onOpen={(e)=>setSelected(e)} />)}
        </section>

        {selected && <Popup concert={selected} onClose={() => {
          setSelected(null);
          setGlobeActive(false);
        }} />}
      </main>
    </div>
  );
}
