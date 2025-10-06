import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { getConcerts } from "../api/concertsApi"; // Note: exported name getConcerts in your version
import Globe from "../components/Globe";
import MapView from "../components/MapView";
import Filters from "../components/Filters";
import VariableProximity from "../components/VariableProximity";
import GlobeLogoSmall from "../components/GlobeLogoSmall";
// artistsData removed (used only for TopPicksCarousel which was removed)
import EventCard from "../components/EventCard";
import Popup from "../components/Popup";
import BackgroundParticles from "../components/BackgroundParticles";
import Footer from "../components/Footer";
import ProfessionalSection from "../components/ProfessionalSection";
import HorizontalTimeline from "../components/HorizontalTimeline";
import ImageTrail from "../components/ImageTrail";
import GlobalEventsStats from "../components/GlobalEventsStats";

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
  const brandRef = useRef(null);
  const [userPos, setUserPos] = useState(null);

  // Determine whether the timeline items include location info (city or coords)
  const timelineSource = (events || []).slice(0, 12);
  const timelineShowsLocation = timelineSource.some(e => Boolean(e.city || e.lat || e.lng));

  useEffect(() => {
    // Fetch concerts from backend API
    (async ()=> {
      let lat, lng;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          setUserPos({ lat, lng });
        } catch {}
      }
      let data = await getConcerts(lat, lng);
      // Map backend concert data to frontend format
      data = (data || []).map(c => ({
        id: c._id || c.apiId,
        artist: Array.isArray(c.artists) ? c.artists.join(', ') : (c.artist || ''),
        name: c.name,
        city: c.city || c.location || '',
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

  // Fullscreen handlers - activated only via explicit fullscreen button clicks
  const handleSurfaceActivate = useCallback(() => {
    // Ensure parent panels stop applying transforms that would clip a fixed child
    try {
      document.querySelectorAll('.view-panel').forEach(el => el.classList.add('no-transform'));
    } catch {}
    setSurfaceActive(true);
  }, []);
  
  const handleSurfaceDeactivate = useCallback(() => {
    try {
      document.querySelectorAll('.view-panel.no-transform').forEach(el => el.classList.remove('no-transform'));
    } catch {}
    setSurfaceActive(false);
  }, []);

  // Keyboard shortcuts for fullscreen mode (H or ESC to exit)
  useEffect(() => {
  const onExit = () => {
    setSurfaceActive(false);
    setSelected(null);
    // Defensive cleanup: remove any lingering classes and trigger resize for Leaflet
    try {
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

        {/* Split-screen hero: left = brand + stats, right = globe/map */}
        <section className={`split-hero ${surfaceActive ? 'fade-out' : ''}`}>
          <div className="hero-left">
            <div className="brand-wrap">
              <div className="brand-globe" aria-hidden="true"><GlobeLogoSmall size={72} /></div>
              <h1 className="brand-title" aria-label="Concerts Global">
                <VariableProximity
                  ref={brandRef}
                  label="Concerts Global"
                  fromFontVariationSettings={`'wght' 400`}
                  toFontVariationSettings={`'wght' 700`}
                  containerRef={brandRef}
                />
              </h1>
               
              <div className="brand-spotline" aria-hidden="false">
                <span className="spot-word">Realtime </span>
                <span className="spot-word">Connect</span>
                <span className="spot-word">Vibe</span>
              </div>
            </div>
            <div className="brand-sub">Discover live music from every corner of the world.</div>
            {/* Stats removed per request */}
          </div>

          <div className="hero-right">
            <div className="view-stack-hero">
              <div className={`view-panel ${viewMode === 'globe' ? 'is-visible' : ''} ${surfaceActive && viewMode === 'globe' ? 'no-transform' : ''}`.trim()}>
                <Globe
                  key={surfaceActive && viewMode === 'globe' ? 'fullscreen' : 'normal'}
                  events={filtered}
                  onMarkerClick={(e) => {
                    if (e) setSelected(e);
                    else setSelected(null);
                  }}
                  onGlobeActivate={handleSurfaceActivate}
                  onGlobeDeactivate={handleSurfaceDeactivate}
                  isActive={surfaceActive && viewMode === 'globe'}
                  containerClassName={viewMode !== 'globe' ? 'is-hidden' : ''}
                />
                {/* Corner toggle inside globe canvas (globe/map icons + fullscreen) */}
                <div className="globe-corner-toggle" aria-hidden>
                  <button type="button" className={`toggle-button ${viewMode === 'globe' ? 'active' : ''}`} onClick={() => setViewMode('globe')} aria-pressed={viewMode === 'globe'} title="Globe view">🌐</button>
                  <button type="button" className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')} aria-pressed={viewMode === 'map'} title="Map view">🗺️</button>
                </div>
              </div>

              <div className={`view-panel ${viewMode === 'map' ? 'is-visible' : ''} ${surfaceActive && viewMode === 'map' ? 'no-transform' : ''}`.trim()}>
                <MapView
                  key={surfaceActive && viewMode === 'map' ? 'map-fullscreen' : 'map-normal'}
                  events={filtered}
                  onMarkerClick={(e) => {
                    if (e) setSelected(e);
                    else setSelected(null);
                  }}
                  onSurfaceActivate={handleSurfaceActivate}
                  onSurfaceDeactivate={handleSurfaceDeactivate}
                  isActive={surfaceActive && viewMode === 'map'}
                  isVisible={viewMode === 'map'}
                />
                {/* Corner toggle inside map canvas (globe/map icons + fullscreen) */}
                <div className="globe-corner-toggle" aria-hidden>
                  <button type="button" className={`toggle-button ${viewMode === 'globe' ? 'active' : ''}`} onClick={() => setViewMode('globe')} aria-pressed={viewMode === 'globe'} title="Globe view">🌐</button>
                  <button type="button" className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')} aria-pressed={viewMode === 'map'} title="Map view">🗺️</button>
                </div>
              </div>
            </div>

            {/* Toggle control bottom-right of the hero-right panel */}
           

            {/* Filters overlay shown only when surfaceActive (fullscreen) */}
            {surfaceActive && (
              <div className="filters-overlay">
                <Filters events={events} continent={continent} setContinent={setContinent} artist={artist} setArtist={setArtist} />
              </div>
            )}
          </div>
        </section>

        {/* Secondary globe section removed per request */}

        {/* Rhythm glass timeline + stats summary */}
        <section className={`rhythm-section ${timelineShowsLocation ? 'timeline-shows-location' : ''}`}>
          <div className="rhythm-inner">
            <div className="rhythm-left">
              <h3 className="rhythm-title">Soon — Live Events</h3>
              <HorizontalTimeline items={timelineSource.map(e => ({ id: e.id, artist: e.artist, name: e.name, date: e.date, city: e.city, venue: e.venue }))} />
              <div className="image-trail-wrap" style={{ marginTop: 18 }}>
                  {/* subtle hint pills — hover to show small instructions */}
                  <div className="image-trail-hints" aria-hidden="false">
                    <button className="hint-pill" aria-describedby="hint-1"><span className="visually-hidden">Hint 1</span>
                      <div id="hint-1" className="hint-tooltip">Hover to preview</div>
                    </button>
                    <button className="hint-pill" aria-describedby="hint-2"><span className="visually-hidden">Hint 2</span>
                      <div id="hint-2" className="hint-tooltip">Click for details</div>
                    </button>
                    <button className="hint-pill" aria-describedby="hint-3"><span className="visually-hidden">Hint 3</span>
                      <div id="hint-3" className="hint-tooltip">Drag or move to play</div>
                    </button>
                  </div>
                <div className="image-trail-header">Your favs (hover)</div>
                <div className="image-trail-container" style={{ height: 220, marginTop: 8, position: 'relative', overflow: 'hidden' }}>
                  <ImageTrail
                    key={timelineSource.length}
                    items={[
                      '/banners/luna_rivers.jpeg',
                      '/banners/rapture.jpeg',
                      '/banners/selena.jpeg',
                      '/banners/smiths.jpeg',
                      '/images/luna_rivers.jpeg',
                      '/images/rapture.jpeg',
                      '/images/selena.jpeg'
                    ]}
                    variant={1}
                  />
                </div>
              </div>
            </div>
            <aside className="rhythm-right">
              <h3 className="rhythm-title">Global events</h3>
              <GlobalEventsStats total={(events || []).length} artists={Array.from(new Set((events || []).map(e => e.artist))).filter(Boolean).length} tracked={(liked || []).length || 0} />
            </aside>
          </div>
        </section>

        {/* Hero carousel (Top Picks) - below the globe */}
        {/* TopPicksCarousel removed per request */}

        <h3 className="cards-section-title">Top events</h3>
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

      {/* Fixed corner toggle: globe / map */}
      <div className="corner-toggle" role="tablist" aria-label="Surface view switcher">
        <button
          type="button"
          className={`toggle-button ${viewMode === 'globe' ? 'active' : ''}`}
          aria-pressed={viewMode === 'globe'}
          onClick={() => setViewMode('globe')}
          title="Globe view"
        >🌐</button>
        <button
          type="button"
          className={`toggle-button ${viewMode === 'map' ? 'active' : ''}`}
          aria-pressed={viewMode === 'map'}
          onClick={() => setViewMode('map')}
          title="Map view"
        >🗺️</button>
      </div>

      <ProfessionalSection />

      <Footer />
    </div>
  );

}