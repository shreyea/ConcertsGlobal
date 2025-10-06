import React from "react";
import { Link, useLocation } from "react-router-dom";
import GlobeLogoSmall from './GlobeLogoSmall';
import '../styles/navigation.css';
import { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/global.css';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { followingArtists } = useContext(AppContext);
  const [openFollowing, setOpenFollowing] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpenFollowing(false);
    }
    document.addEventListener('click', onDoc);

    return () => {
      document.removeEventListener('click', onDoc);
    };
  }, []);

  return (
    <>
  <div className={`floating-nav`} role="navigation" aria-label="Main navigation">
        <div className="floating-inner">
          <nav className="floating-links" aria-label="Primary">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/artists" className="nav-link">Artists</Link>
            <Link to="/around-me" className="nav-link">Around Me</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </nav>
        </div>
      </div>

      {/* sticky globe to the top-left on non-home pages (kept for accessibility) */}
      {!isHome && (
        <Link to="/" className="globe-sticky" aria-label="Home">
          <GlobeLogoSmall size={44} />
        </Link>
      )}
    </>
  );
}