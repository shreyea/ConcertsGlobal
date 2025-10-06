import React, { useEffect, useState } from 'react';

export default function GlobalEventsStats({ total = 0, artists = 0, tracked = 0 }) {
  const [display, setDisplay] = useState(total);

  useEffect(() => {
    // animate number increment smoothly
    let raf = null;
    const start = display;
    const end = total;
    const dur = 700;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const val = Math.floor(start + (end - start) * p);
      setDisplay(val);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  return (
    <div className="global-events-root">
      <div className="global-events-visual ge-glass">
        <div className="rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <div className="core">
            <div className="count">{display}</div>
            <div className="label">Global events</div>
          </div>
        </div>
      </div>

      <div className="global-events-cards">
        <div className="ge-card small artists">
          <div className="ge-card-title">Artists</div>
          <div className="ge-card-value">{artists}</div>
        </div>
        <div className="ge-card small tracked">
          <div className="ge-card-title">Tracked</div>
          <div className="ge-card-value">{tracked}</div>
        </div>
      </div>
    </div>
  );
}
