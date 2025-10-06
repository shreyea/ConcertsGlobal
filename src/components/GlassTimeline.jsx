import React from 'react';

function HaversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => v * Math.PI / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function GlassTimeline({ items = [], userPos = null }) {
  return (
    <div className="glass-timeline-root">
      <div className="glass-track" aria-hidden>
        {items.map((it, i) => (
          <div key={it.id || i} className="glass-node">
            <div className="node-dot" aria-hidden />
            <div className="node-panel" tabIndex={0} aria-labelledby={`gt-title-${i}`}>
              <div id={`gt-title-${i}`} className="panel-title">{it.artist || it.name || 'Artist'}</div>
              <div className="panel-meta">{it.city || it.venue || ''} <span className="muted">• {it.date || ''}</span></div>
              <div className="panel-actions">
                <button className="btn small">View</button>
                <button className="btn small ghost">Track</button>
              </div>
              {userPos && it.lat && it.lng && (
                <div className="panel-distance muted">{Math.round(HaversineDistance(userPos.lat, userPos.lng, it.lat, it.lng))} km</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
