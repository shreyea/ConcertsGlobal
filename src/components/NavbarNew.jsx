import React from "react";
import { Link, useLocation } from "react-router-dom";
import GlobeLogoSmall from './GlobeLogoSmall';
import '../styles/navigation.css';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            <GlobeLogoSmall size={44} />
            <h1 className="brand-text">Concerts Global</h1>
          </Link>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/artists">Artists</Link>
            <Link to="/around-me">Around Me</Link>
            <Link to="/login">Login</Link>
          </nav>
        </div>
      </header>

      {/* sticky globe to the top-left on non-home pages */}
      {!isHome && (
        <Link to="/" className="globe-sticky" aria-label="Home">
          <GlobeLogoSmall size={44} />
        </Link>
      )}
    </>
  );
}