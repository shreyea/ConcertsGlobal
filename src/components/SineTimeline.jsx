import React, { useRef, useEffect, useState } from 'react';

export default function SineTimeline({ items = [], amplitude = 36, frequency = 1.2, height = 160 }) {
	const containerRef = useRef(null);
	const [size, setSize] = useState({ width: 800, height });

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			setSize({ width: el.clientWidth || 800, height });
		});
		ro.observe(el);
		setSize({ width: el.clientWidth || 800, height });
		return () => ro.disconnect();
	}, [height]);

	const points = (() => {
		const w = Math.max(200, size.width || 800);
		const cx = w / 2;
		const cy = size.height / 2;
		const n = Math.max(1, items.length || 1);
		const pts = [];
		for (let i = 0; i < n; i++) {
			const t = n === 1 ? 0.5 : i / (n - 1);
			const x = 20 + t * (w - 40);
			const phase = t * Math.PI * 2 * frequency;
			const y = cy + Math.sin(phase) * amplitude;
			pts.push({ x, y });
		}
		return pts;
	})();

	const pathD = (() => {
		if (!points.length) return '';
		let d = `M ${points[0].x} ${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const cur = points[i];
			const cx = (prev.x + cur.x) / 2;
			const cy = (prev.y + cur.y) / 2;
			d += ` Q ${prev.x} ${prev.y} ${cx} ${cy}`;
		}
		const last = points[points.length - 1];
		d += ` T ${last.x} ${last.y}`;
		return d;
	})();

	return (
		<div ref={containerRef} className="sine-timeline-root" style={{ height: size.height }}>
			<svg className="sine-svg" width="100%" height={size.height} viewBox={`0 0 ${Math.max(320, size.width)} ${size.height}`} preserveAspectRatio="none" aria-hidden>
				<defs>
					<linearGradient id="sineGrad" x1="0%" x2="100%" y1="0%" y2="0%">
						<stop offset="0%" stopColor="#4f46e5" />
						<stop offset="50%" stopColor="#5b21b6" />
						<stop offset="100%" stopColor="#7c3aed" />
					</linearGradient>
				</defs>
				<path className="sine-path" d={pathD} fill="none" stroke="url(#sineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
			</svg>

			{points.map((p, idx) => {
				const item = items[idx] || {};
				const left = `${(p.x / Math.max(320, size.width)) * 100}%`;
				const top = `${p.y}px`;
				return (
					<div
						key={item.id || idx}
						className={`event-bubble ${idx % 2 === 0 ? 'bubble-left' : 'bubble-right'}`}
						style={{ left, transform: `translate(-50%, calc(-50%))`, top }}
						title={`${item.artist || item.name || 'Event'} — ${item.city || ''}`}
					>
						<div className="bubble-core" style={{ animationDelay: `${(idx % 4) * 140}ms` }} tabIndex={0} aria-describedby={`bubble-tt-${idx}`}>
							<img src={item.image || '/logo.png'} alt={item.name || item.artist || 'artist'} />
						</div>
						<div className="bubble-label">{item.artist || item.name || item.city || 'Live'}</div>
						<div id={`bubble-tt-${idx}`} className="bubble-tooltip" role="status">
							<div className="tt-title">{item.artist || item.name || 'Live'}</div>
							{item.city && <div className="tt-sub">{item.city}</div>}
						</div>
					</div>
				);
			})}
		</div>
	);
}
