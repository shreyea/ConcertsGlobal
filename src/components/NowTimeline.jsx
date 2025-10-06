import React, { useEffect, useRef } from 'react';

export default function NowTimeline({ items = [] }) {
  const railRef = useRef(null);

  useEffect(() => {
    // Auto-scroll animation
    const el = railRef.current;
    if (!el) return;
    let raf = null;
    let pos = 0;
    const step = () => {
      pos += 0.25; // speed
      if (pos >= el.scrollWidth - el.clientWidth) pos = 0;
      el.scrollLeft = pos;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items.length]);

  return (
    <div className="now-timeline-wrap">
      <div className="now-timeline" ref={railRef} role="list">
        {items.map((it, i) => (
          <div className="now-item" role="listitem" key={i}>
            <div className="now-item-bg" />
            <div className="now-item-content">
              <div className="now-artist">{it.artist}</div>
              <div className="now-city">{it.city}</div>
              <div className="now-time muted">{it.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
