import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundParticles from "../components/BackgroundParticles";
import { getConcerts } from "../api/concertsApi";
import EventCard from "../components/EventCard";
import { AppContext } from "../context/AppContext";


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
  const [showPlannedModal, setShowPlannedModal] = useState(false);
  const { planned, removePlanned, lastPlannedAt, notify, lastPlannedAction, lastMovedId, setActivePlan } = useContext(AppContext);
  const [showInlineAction, setShowInlineAction] = useState(false);
  const [highlightId, setHighlightId] = useState(null);

  useEffect(() => {
    if (!lastPlannedAction) return;
    setShowInlineAction(true);
    const t = setTimeout(() => setShowInlineAction(false), 2000);
    return () => clearTimeout(t);
  }, [lastPlannedAction]);

  useEffect(() => {
    if (!lastMovedId) return;
    setHighlightId(lastMovedId);
    const t = setTimeout(() => setHighlightId(null), 900);
    return () => clearTimeout(t);
  }, [lastMovedId]);
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!lastPlannedAt) return;
    // trigger a brief pulse when a new plan is added
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 900);
    return () => clearTimeout(t);
  }, [lastPlannedAt]);

  useEffect(()=> {
    navigator.geolocation.getCurrentPosition((p)=> setPos({lat:p.coords.latitude, lng:p.coords.longitude}), ()=> setPos(null));
    getConcerts().then(data => {
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
            <div className={`planned-badge ${pulse ? 'pulse' : ''}`} onClick={() => setShowPlannedModal(true)} style={{ cursor: 'pointer' }}>
              📌 Planned{Array.isArray(planned) && planned.length ? ` (${planned.length})` : ''}
            </div>
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
        {showPlannedModal && (
          <div className="planned-modal" style={{ position: 'fixed', left: 0, right: 0, top: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowPlannedModal(false)}>
            <div style={{ background: '#071122', padding: 18, borderRadius: 10, width: 680, maxHeight: '80vh', overflow: 'auto' }} onClick={(e)=>e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Planned</h3>
                <button className="btn" onClick={() => setShowPlannedModal(false)}>Close</button>
              </div>
              {(!planned || planned.length === 0) ? (
                <div className="muted">No planned items yet.</div>
              ) : (
                <div>
                  {showInlineAction && lastPlannedAction && (
                    <div style={{ marginBottom: 10, padding: '8px 10px', borderRadius: 8, background: 'linear-gradient(90deg, rgba(59,130,246,0.08), rgba(96,165,250,0.04))', border: '1px solid rgba(59,130,246,0.12)', color: 'var(--text-secondary)' }}>
                      {lastPlannedAction.type === 'duplicate' ? 'Plan already saved — moved to top' : 'Plan added to Planned'}
                    </div>
                  )}
                  <ul>
                    {planned.map((p, idx) => (
                      <li key={p.id || idx} className={`planned-item ${highlightId && String(p.id) === String(highlightId) ? 'moved' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{p.event?.name || 'Custom plan'}</strong>
                          <div className="meta">{p.event?.city}</div>
                        </div>
                        <div className="meta">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
                        <div className="actions">
                          <button className="btn" onClick={() => {
                            try { setActivePlan(p); } catch (e) { console.warn('setActivePlan failed', e); }
                            try { navigate('/plan', { state: { planId: p.id } }); } catch (e) { navigate('/'); }
                            setShowPlannedModal(false);
                          }}>Open</button>
                          {p.id && (
                            <button className="btn" style={{ marginLeft: 8 }} onClick={async () => {
                              try {
                                const url = `${window.location.origin}/plans/${p.id}`;
                                await navigator.clipboard.writeText(url);
                                notify && notify('Share link copied');
                              } catch (e) { window.open(`/plans/${p.id}`, '_blank'); }
                            }}>Share</button>
                          )}
                          <button className="btn" style={{ marginLeft: 8 }} onClick={() => { removePlanned(p.id); notify && notify('Removed planned item'); }}>Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
