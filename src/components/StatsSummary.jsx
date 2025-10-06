import React from 'react';

export default function StatsSummary({ total = 0, tracked = 0, around = 0 }) {
  return (
    <div className="stats-summary-root">
      <div className="stat-card big">
        <div className="stat-value">{total}</div>
        <div className="stat-label">Total Events</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{tracked}</div>
        <div className="stat-label">Tracked</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{around}</div>
        <div className="stat-label">Around Me</div>
      </div>
    </div>
  );
}
