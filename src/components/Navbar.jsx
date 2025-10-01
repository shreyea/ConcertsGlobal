import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import VariableProximity from './VariableProximity';
import image from '../assets/logo.png';
export default function Navbar(){
  const containerRef = useRef(null);
  const [proximity, setProximity] = useState(0);

  function handleMouseMove(e) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Calculate proximity as distance from center (0 to 1)
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const maxDist = Math.sqrt(cx ** 2 + cy ** 2);
    setProximity(1 - Math.min(dist / maxDist, 1));
  }

  function handleMouseLeave() {
    setProximity(0);
  }

  return (
    <header className="nav">
      <div className="nav-inner">
 <img 
    src={image} 
    alt="Logo" 
    className="circular-logo" // Use the class name
/>
        <div
          ref={containerRef}
          style={{position: 'relative'}}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <VariableProximity
            label={'Concerts Global'}
            className={'variable-proximity-demo'}
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={containerRef}
            radius={100}
            falloff='linear'
            proximity={proximity}
            style={{ fontSize: '3rem', lineHeight: '1.1' }}
          />
        </div>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/liked">Liked</Link>
          <Link to="/around-me">Around Me</Link>
          <Link to="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
