import React, { useEffect, useState } from 'react';

export default function GlobalPulse({ counts = { listeners: 1240, events: 256 }, beatInterval = 900 }) {
	const [tick, setTick] = useState(0);
	const [rings, setRings] = useState([]);

	useEffect(() => {
		const id = setInterval(() => {
			setTick(t => t + 1);
			setRings(r => [...r.slice(-3), { id: Date.now() }]);
		}, beatInterval);
		return () => clearInterval(id);
	}, [beatInterval]);

	useEffect(() => {
		const cleanup = setInterval(() => {
			setRings(r => r.filter((_, i) => i > -10));
		}, 2000);
		return () => clearInterval(cleanup);
	}, []);

	return (
		<div className="global-pulse-root" aria-hidden>
			<div className="pulse-center">
				<div className="pulse-core">
					<div className="pulse-number">{counts.listeners.toLocaleString()}</div>
					<div className="pulse-label">Listeners</div>
				</div>
				{rings.map(r => <span key={r.id} className="pulse-ring" />)}
			</div>

			<div className="pulse-stats">
				<div className="stat-row">
					<div className="stat-name">Events</div>
					<div className="stat-value">{counts.events}</div>
				</div>
				<div className="stat-row muted">
					<div className="stat-name">Active Cities</div>
					<div className="stat-value">89</div>
				</div>
			</div>
		</div>
	);
}

