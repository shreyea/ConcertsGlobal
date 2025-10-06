import React, { useRef, useEffect, useState } from 'react';

export default function HorizontalTimeline({ items = [] }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    measure();
    return () => ro.disconnect();

    function measure() {
      const cards = Array.from(el.querySelectorAll('.ht-card'));
      const pos = cards.map(c => {
        const r = c.getBoundingClientRect();
        const parent = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - parent.left, y: r.top + r.height / 2 - parent.top };
      });
      setPositions(pos);
    }
  }, [items]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const path = svg.querySelector('.ht-path');
    if (!path) return;
    // Animate stroke dashoffset for pulse effect
    const length = path.getTotalLength ? path.getTotalLength() : 0;
    // keep the full route visible (don't animate dashoffset to invisible)
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = 0;
    // Animate a thin flowing highlight along the route (subtle shimmer)
    const flow = svg.querySelector('.ht-path-flow');
    let flowAnim = null;
    if (flow && flow.getTotalLength) {
      const flowLen = flow.getTotalLength();
      if (!flowLen) {
        // nothing to animate
        return undefined;
      }
      // sensible dash pattern relative to path length; ensures visible moving segments
      flow.style.strokeDasharray = `${Math.max(12, Math.round(flowLen / 60))} ${Math.max(8, Math.round(flowLen / 40))}`;
      flow.style.strokeDashoffset = 0;
      try {
        flowAnim = flow.animate([
          { strokeDashoffset: 0 },
          { strokeDashoffset: -flowLen }
        ], { duration: 2200, iterations: Infinity, easing: 'linear' });
      } catch (e) {
        // If Web Animations aren't available, fall back to CSS animation defined in stylesheet.
        flow.style.animation = 'htFlowCSS 2200ms linear infinite';
      }
    }
    return () => { if (flowAnim) flowAnim.cancel(); };
  }, [positions]);

  const d = (() => {
    // If measured positions are empty (e.g. initial render), create a fallback
    // evenly spaced baseline so the path and flow are visible immediately.
    const el = containerRef.current;
    if (!positions.length) {
      if (!el || !items || !items.length) return '';
      const w = el.clientWidth || 800;
      const h = el.clientHeight || 160;
      const pts = items.map((_, i) => {
        const x = Math.round(((i + 1) / (items.length + 1)) * w);
        const y = Math.round(h / 2);
        return { x, y };
      });
      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }
    return positions.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  })();

  return (
    <div className="horizontal-timeline-root">
      <div className="ht-viewport" ref={containerRef} tabIndex={0} aria-label="Soon timeline">
        <div className="ht-track">
          {items.map((it, i) => (
            <div key={it.id || i} className="ht-card" role="button" tabIndex={0} aria-describedby={`ht-tt-${i}`} style={{ ['--i']: i }}>
              <div className="ht-card-inner">
                <div className="ht-title">{it.artist || it.name || 'Artist'}</div>
                <div className="ht-city muted">{it.city || ''}</div>
                <div className="ht-time muted">{it.date || 'Soon'}</div>
              </div>
              <div id={`ht-tt-${i}`} className="ht-tooltip" role="status">
                <div className="tt-name">{it.artist || it.name}</div>
                <div className="tt-meta">{it.city || ''} • {it.venue || 'TBA'}</div>
                <div className="tt-actions"><button className="btn small">Details</button></div>
              </div>
            </div>
          ))}
        </div>

        <svg ref={svgRef} className="ht-svg" width="100%" height="100%" preserveAspectRatio="none">
          {/* Glow path rendered beneath the main stroke to give a soft halo */}
          <path className="ht-path-glow" d={d} stroke="url(#htGrad)" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* Thin flowing highlight that moves along the route */}
          <path
            className="ht-path-flow"
            d={d}
            stroke="url(#htGrad)"
            fill="none"
            strokeLinejoin="round"
            style={{
              stroke: '#06b6d4',
              strokeWidth: 6,
              strokeLinecap: 'round',
              strokeOpacity: 1,
              strokeDasharray: '18 220',
              pointerEvents: 'none'
            }}
          />
          {/* Main visible route */}
          <path className="ht-path" d={d} stroke="url(#htGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="htGrad" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
