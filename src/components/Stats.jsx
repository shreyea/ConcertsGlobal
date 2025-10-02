import React from "react";
import { Link } from "react-router-dom";

export default function Stats({ events, liked }) {
  const total = events.length;
  const live = events.filter(e => e.isLive).length;
  return (
    <section className="stats-wrap">
      <Link to="/live-events" className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="stat-number">{live}</div>
        <div className="stat-label">Live Now</div>
      </Link>
      <Link to="/all-events" className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="stat-number">{total}</div>
        <div className="stat-label">Total Events</div>
      </Link>
      <Link to="/tracked" className="stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="stat-number">{liked.length}</div>
        <div className="stat-label">Tracked</div>
      </Link>
    </section>
  );
}
