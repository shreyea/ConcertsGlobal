import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GENRE_COLORS = {
  'Indie Pop': 'var(--accent-primary)',
  Pop: 'var(--accent-primary)',
  Rock: '#ff6b6b',
  Jazz: '#9f7aea',
  Classical: '#f6d365',
  EDM: '#06b6d4',
  Electronic: '#06b6d4',
  Indie: '#60a5fa',
  'Hip-Hop': '#f59e0b',
  'Bollywood Fusion': '#f472b6',
  'J-Pop': '#a78bfa',
  'Latin Pop': '#fb7185',
  'Alternative Rock': '#f97316',
  Soul: '#ef9a9a',
  'R&B': '#fbcfe8',
  'Psychedelic Rock': '#7c3aed'
};

function clampText(text, n = 140) {
  if (!text) return '';
  return text.length > n ? text.slice(0, n).trim() + '…' : text;
}

export default function TopPicksCarousel({ items = [], autoPlay = true, interval = 5000 }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const touchStartRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % Math.max(1, items.length)), interval);
    return () => clearInterval(timerRef.current);
  }, [items.length, autoPlay, interval]);

  useEffect(() => {
    // reset index if items change
    setIndex(0);
  }, [items]);

  function goto(i) {
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    setIndex(i);
    clearInterval(timerRef.current);
    // restart autoplay
    if (autoPlay) timerRef.current = setInterval(() => setIndex(x => (x + 1) % Math.max(1, items.length)), interval);
  }

  function handleTouchStart(e) {
    touchStartRef.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e) {
    const start = touchStartRef.current;
    if (start == null) return;
    const end = e.changedTouches[0].clientX;
    const diff = end - start;
    if (Math.abs(diff) > 40) {
      if (diff < 0) goto(index + 1); else goto(index - 1);
    }
    touchStartRef.current = null;
  }

  // If there are no items, render a subtle placeholder to keep the hero area visible
  if (!items || items.length === 0) {
    return (
      <div className="hero-carousel">
        <div className="hero-slides" style={{ minHeight: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ padding: 28, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ fontWeight: 700 }}>No top picks yet</div>
            <div className="muted" style={{ marginTop: 6 }}>Featured artists will appear here once available.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-carousel" ref={rootRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="hero-slides">
        {items.map((a, i) => {
          const active = i === index;
          const bg = a.image || '/logo.png';
          const color = GENRE_COLORS[a.genre] || 'rgba(6,182,212,0.14)';
          const isLive = a.latestShow && (() => {
            try {
              const d = new Date(a.latestShow.date || a.latestShow?.start || a.latestShow?.datetime);
              const today = new Date();
              return d && d.toDateString() === today.toDateString();
            } catch { return false; }
          })();

          return (
            <div
              key={a.id}
              className={`hero-slide ${active ? 'is-active' : ''}`}
              style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: color + '22', minHeight: '320px', cursor: 'pointer' }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${a.name} — ${a.genre}`}
              onClick={() => navigate(`/artist/${a.id}`, { state: { artist: a } })}
            >
              <div className="hero-overlay" style={{ background: `linear-gradient(180deg, rgba(3,7,18,0.12), ${color}44 60%)` }} />
              <div className="hero-content">
                <div className="hero-meta">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div className="hero-genre" style={{ background: `${color}22`, border: `1px solid ${color}33` }}>{a.genre}</div>
                    {isLive && <div className="live-badge">LIVE</div>}
                  </div>
                  <h2 className="hero-title">{a.name}</h2>
                  <p className="hero-bio">{clampText(a.bio || a.description, 160)}</p>
                  <div className="hero-latest muted">{a.latestShow ? `${a.latestShow.date || a.nextEvent?.date} • ${a.latestShow?.venue || a.nextEvent?.title} • ${a.country || a.nextEvent?.venue || ''}` : 'No upcoming shows'}</div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-primary">View Artist</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* controls */}
      <button className="hero-arrow hero-prev" aria-label="Previous" onClick={() => goto(index - 1)}>‹</button>
      <button className="hero-arrow hero-next" aria-label="Next" onClick={() => goto(index + 1)}>›</button>

      <div className="hero-dots">
        {items.map((_, i) => (
          <button key={i} className={`hero-dot ${i === index ? 'active' : ''}`} onClick={() => goto(i)} aria-label={`Go to slide ${i+1}`} />
        ))}
      </div>
    </div>
  );
}
