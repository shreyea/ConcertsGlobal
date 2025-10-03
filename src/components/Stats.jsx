import React from "react";
import { Link } from "react-router-dom";
import CountUp from "./text";

export default function Stats({ events, liked }) {
  const total = events.length;
  const live = events.filter(e => e.isLive).length;
  return (
    <section className="stats-wrap">
      <Link to="/live-events" className="stat-card">
        <div className="stat-number">
          <CountUp from={0} to={live} separator="," direction="up" duration={0.5} className="count-up-text" />
        </div>
        <div className="stat-label">Live Now</div>
      </Link>
      <Link to="/all-events" className="stat-card">
        <div className="stat-number">
          <CountUp from={0} to={total} separator="," direction="up" duration={0.5} className="count-up-text" />
        </div>
        <div className="stat-label">Total Events</div>
      </Link>
      <Link to="/tracked" className="stat-card">
        <div className="stat-number">
          <CountUp from={0} to={liked.length} separator="," direction="up" duration={0.5} className="count-up-text" />
        </div>
        <div className="stat-label">Tracked</div>
      </Link>
    </section>
  );
}
