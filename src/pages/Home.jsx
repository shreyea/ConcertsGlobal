import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { getConcerts } from "../api/concertsApi"; // Note: exported name getConcerts in your version
import Globe from "../components/Globe";
import MapView from "../components/MapView";
import Stats from "../components/Stats";
import Filters from "../components/Filters";
import EventCard from "../components/EventCard";
import Popup from "../components/Popup";
import BackgroundParticles from "../components/BackgroundParticles";
import Footer from "../components/Footer";
import ProfessionalSection from "../components/ProfessionalSection";

import { AppContext } from "../context/AppContext";

export default function Home(){
  const [events, setEvents] = useState([]);
  const [continent, setContinent] = useState("");
  const [artist, setArtist] = useState("");
  const [selected, setSelected] = useState(null);
  const [surfaceActive, setSurfaceActive] = useState(false);
  const [viewMode, setViewMode] = useState("globe");
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

    // WebSocket for real-time updates - only in production
    if (import.meta.env.PROD) {
      const connectWebSocket = () => {
        try {
          wsRef.current = new window.WebSocket("ws://localhost:4000");
          
          wsRef.current.onopen = () => {
            console.log('WebSocket connected');
          };
          
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
            } catch (error) {
              console.warn('WebSocket message error:', error);
            }
          };
          
          wsRef.current.onclose = () => {
            console.log('WebSocket disconnected, retrying in 5s...');
            wsRef.current = null;
            setTimeout(connectWebSocket, 5000);
          };
          
          wsRef.current.onerror = (error) => {
            console.warn('WebSocket error:', error);
          };
        } catch (error) {
          console.warn('WebSocket connection error:', error);
          setTimeout(connectWebSocket, 5000);
        }
      };
      
      connectWebSocket();
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, []);

  const handleSurfaceActivate = useCallback(() => setSurfaceActive(true), []);
  const handleSurfaceDeactivate = useCallback(() => setSurfaceActive(false), []);

  useEffect(() => {
    setSurfaceActive(false);
  }, [viewMode]);

useEffect(() => {
  const onExit = () => {
    setSurfaceActive(false);
    setSelected(null);
    // Defensive cleanup: remove any lingering classes and trigger resize for Leaflet
    try {
      document.querySelectorAll('.globe-area-60.globe-fullscreen').forEach(el => el.classList.remove('globe-fullscreen'));
      document.querySelectorAll('.view-panel.no-transform').forEach(el => el.classList.remove('no-transform'));
    } catch {}
    try { window.dispatchEvent(new Event('resize')); } catch {}
  };

  const handleKeyEvent = (event) => {
    const key = (event.key || '').toLowerCase();
    if (!surfaceActive) return;
    if (key === 'h' || key === 'escape') {
      onExit();
    }
  };

  window.addEventListener('keydown', handleKeyEvent);
  window.addEventListener('keyup', handleKeyEvent);
  return () => {
    window.removeEventListener('keydown', handleKeyEvent);
    window.removeEventListener('keyup', handleKeyEvent);
  };
}, [surfaceActive]);

// When surfaceActive flips to false by any means, ensure everything is cleaned up
useEffect(() => {
  if (!surfaceActive) {
    try {
      document.querySelectorAll('.globe-area-60.globe-fullscreen').forEach(el => el.classList.remove('globe-fullscreen'));
      document.querySelectorAll('.view-panel.no-transform').forEach(el => el.classList.remove('no-transform'));
    } catch {}
    try { window.dispatchEvent(new Event('resize')); } catch {}
  }
}, [surfaceActive]);


  // filters
  const filtered = events.filter(e => {
    const cOK = !continent || e.continent === continent;
    const aOK = !artist || e.artist.toLowerCase().includes(artist.toLowerCase());
    return cOK && aOK;
  });

  return (
    <div className="page-root page-home page-home-wrapper">
      <BackgroundParticles id="home-bg" />
      
      <div className="home-bg-overlay">
        <Canvas className="home-bg-canvas">
          <Stars radius={100} depth={100} count={1000} factor={1} fade />
        </Canvas>
      </div>
  <div className="page home page-home-main">
    <main className="main-container main-container-full">

        <section className={`top-section ${surfaceActive ? 'fade-out' : ''}`}>
          <Stats events={filtered} liked={liked} />
          <Filters events={events} continent={continent} setContinent={setContinent} artist={artist} setArtist={setArtist} />
        </section>

        <section className="globe-section">
          <div className={`view-toggle${surfaceActive ? ' fade-out' : ''}`} role="tablist" aria-label="Surface view switcher">
            <button
              type="button"
              className={`toggle-button ${viewMode === 'globe' ? 'active' : ''}`}
              aria-pressed={viewMode === 'globe'}
              onClick={() => setViewMode('globe')}
            >
              <span role="img" aria-label="Globe view">🌍</span>
              <span className="toggle-label">Globe</span>
            </button>
            <button
              type="button"
              className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`}
              aria-pressed={viewMode === 'map'}
              onClick={() => setViewMode('map')}
            >
              <span role="img" aria-label="Map view">🗺️</span>
              <span className="toggle-label">Map</span>
            </button>
          </div>

          <div className="view-stack">
            <div className={`view-panel ${viewMode === 'globe' ? 'is-visible' : ''} ${surfaceActive && viewMode === 'globe' ? 'no-transform' : ''}`.trim()}>
              <Globe
                key={surfaceActive ? 'fullscreen' : 'normal'}
                events={filtered}
                onMarkerClick={(e) => {
                  if (e) setSelected(e);
                  else setSelected(null);
                }}
                onGlobeActivate={handleSurfaceActivate}
                onGlobeDeactivate={handleSurfaceDeactivate}
                isActive={surfaceActive}
                containerClassName={viewMode !== 'globe' ? 'is-hidden' : ''}
              />
            </div>

            <div className={`view-panel ${viewMode === 'map' ? 'is-visible' : ''} ${surfaceActive && viewMode === 'map' ? 'no-transform' : ''}`.trim()}>
              <MapView
                key={surfaceActive ? 'map-fullscreen' : 'map-normal'}
                events={filtered}
                onMarkerClick={(e) => {
                  if (e) setSelected(e);
                  else setSelected(null);
                }}
                onSurfaceActivate={handleSurfaceActivate}
                onSurfaceDeactivate={handleSurfaceDeactivate}
                isActive={surfaceActive}
                isVisible={viewMode === 'map'}
              />
            </div>
          </div>
        </section>

        <section className={`cards-section${surfaceActive ? " fade-out" : ""}`}>
         
          {filtered.map(ev => <EventCard key={ev.id} event={ev} onOpen={(e)=>setSelected(e)} />)} 
         
        </section>

        {selected && <Popup concert={selected} onClose={() => {
          setSelected(null);
          setSurfaceActive(false);
        }} />}
      </main>
    </div>

      {surfaceActive && (
        <div className="fullscreen-hint">Press H to escape</div>
      )}

      <ProfessionalSection />

      <Footer />
    </div>
  );

}