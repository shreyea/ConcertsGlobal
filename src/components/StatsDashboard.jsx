import React from 'react';

export default function StatsDashboard({ total = 0, artists = 0, tracked = 0 }) {
  return (
    <div className="stats-dashboard-root">
      <div className="sd-card total">
        <div className="sd-value">{total}</div>
        <div className="sd-label">Total Events</div>
      </div>
      <div className="sd-row">
        <div className="sd-card small">
          <div className="sd-value">{artists}</div>
          <div className="sd-label">Artists</div>
        </div>
        <div className="sd-card small">
          <div className="sd-value">{tracked}</div>
          <div className="sd-label">Tracked</div>
        </div>
      </div>
    </div>
  );
}
