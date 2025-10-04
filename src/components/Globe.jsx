import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";

/* lat/lng -> xyz on sphere r */
function latLngToXYZ(lat, lng, r = 2.5) {
  const phi = (90 - lat) * (Math.PI / 180);   // latitude -> polar angle
  const theta = (lng + 180) * (Math.PI / 180); // longitude -> azimuthal angle

  const x = -r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

function Marker({ pos, onClick, event }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={pos}>
      <mesh 
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
      >
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial 
          color={hovered ? "#ffd700" : "#ffb347"} 
          emissive={hovered ? "#ff9900" : "#ff7a00"} 
          emissiveIntensity={hovered ? 1.2 : 0.9} 
        />
      </mesh>
      {hovered && (
        <Html position={[0, 0.15, 0]} center distanceFactor={8}>
          <div className="marker-tooltip">
            <div>{event.name}</div>
            <div className="muted">{event.artist}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Globe({ 
  events = [], 
  onMarkerClick = ()=>{}, 
  onGlobeActivate = ()=>{}, 
  onGlobeDeactivate = ()=>{}, 
  isActive = false,
  containerClassName = ""
}) {
  const [texture, setTexture] = useState(null);
  const mountedRef = useRef(true);
  const controlsRef = useRef();

  useEffect(() => {
    mountedRef.current = true;
    const loader = new THREE.TextureLoader();
    const lowRes = "/earth_texture1.jpg";
    const highRes = "/earth_latlong_texture.png";

    // Start high-res fetch immediately so the browser begins downloading it as early as possible
    loader.load(highRes, (hiTex) => {
      if (!mountedRef.current) return;
      try {
        hiTex.wrapS = THREE.RepeatWrapping;
        hiTex.wrapT = THREE.ClampToEdgeWrapping;
        hiTex.repeat.x = 1;
        hiTex.offset.x = 0;
        hiTex.anisotropy = Math.min(16, hiTex.anisotropy || 12);
        hiTex.encoding = THREE.sRGBEncoding;
        hiTex.generateMipmaps = true;
        hiTex.needsUpdate = true;
        setTexture(hiTex);
      } catch (e) { /* ignore */ }
    }, undefined, (err) => {
      // high-res may fail or be slow; we'll still attempt low-res for quick paint
    });

    // Load low-res immediately as well to show a fast initial texture
    loader.load(lowRes, (lowTex) => {
      if (!mountedRef.current) return;
      try {
        lowTex.wrapS = THREE.RepeatWrapping;
        lowTex.wrapT = THREE.ClampToEdgeWrapping;
        lowTex.repeat.x = 1;
        lowTex.offset.x = 0;
        lowTex.anisotropy = 4;
        lowTex.encoding = THREE.sRGBEncoding;
        lowTex.generateMipmaps = false;
        lowTex.needsUpdate = true;
        // only set low-res if no high-res already set
        setTexture((prev) => prev ?? lowTex);
      } catch (e) { /* ignore */ }
    }, undefined, (err) => {
      console.warn("Low-res texture load failed", err);
      // if low-res fails, rely on high-res loader above
    });
    return () => { mountedRef.current = false; };
  }, []);

  // Prevent accidental zoom on scroll
  useEffect(() => {
    const handleWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const globeContainer = document.querySelector('.globe-area-60');
    if (globeContainer) {
      globeContainer.addEventListener('wheel', handleWheel, { passive: false });
      return () => globeContainer.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Toggle fullscreen via the small button only
  const toggleFullscreen = () => {
    if (isActive) onGlobeDeactivate();
    else onGlobeActivate();
  };
  useEffect(() => {
    // keep parent in sync; when isActive becomes false, ensure deactivate callback side-effects run
    if (!isActive) {
      onGlobeDeactivate();
    }
  }, [isActive, onGlobeDeactivate]);


  return (
    <div
      className={`globe-area-60 ${isActive ? 'globe-fullscreen' : ''} ${containerClassName}`.trim()}
      role="presentation"
    >
      {/* fullscreen toggle icon (top-left) - click only this to toggle fullscreen */}
      <button
        className="globe-fullscreen-btn"
        aria-label={isActive ? 'Exit fullscreen' : 'Enter fullscreen'}
        onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
        title={isActive ? 'minimize' : 'fullscreen'}
      >
        {/* clean outline fullscreen icon (uses stroke for clarity) */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9V3h6" />
            <path d="M21 9V3h-6" />
            <path d="M3 15v6h6" />
            <path d="M21 15v6h-6" />
          </g>
        </svg>
      </button>
  <Canvas
    className="globe-canvas"
    camera={{ position: [0, 0, 6], fov: 45 }}
    gl={{ alpha: false }}
    onCreated={({ gl }) => {
      // set an opaque clear color that matches the globe surface/backdrop
      gl.setClearColor(new THREE.Color(0x0b1b22));
      gl.outputEncoding = THREE.sRGBEncoding;
    }}
  >
        <ambientLight intensity={1}/>
        <directionalLight position={[5,5,5]} intensity={1}/>
        <Stars radius={100} depth={50} count={1000} factor={4} fade />

        <group rotation={[0, -Math.PI / 2, 0]}>
          <mesh
            onClick={() => {
              handleActivate();
              onMarkerClick(null);
            }}
          >
            <sphereGeometry args={[2, 64, 64]} />
            <meshStandardMaterial 
              map={texture ?? null} 
              color={texture ? undefined : "#0b2f4a"} 
            />
          </mesh>

          {Array.isArray(events) && events.map(ev => {
            const lat = typeof ev.lat === "number" ? ev.lat : (ev.location?.lat ?? null);
            const lng = typeof ev.lng === "number" ? ev.lng : (ev.location?.lng ?? null);
            if (typeof lat !== "number" || typeof lng !== "number") return null;
            const pos = latLngToXYZ(lat, lng, 2);
            return (
              <Marker
                key={ev.id}
                pos={pos}
                event={ev}
                onClick={() => {
                  handleActivate();
                  onMarkerClick(ev);
                }}
              />
            );
          })}
        </group>

        <OrbitControls 
          ref={controlsRef}
          enablePan={false} 
          rotateSpeed={0.4}
          enableZoom={true}
          zoomSpeed={0.5}
          minDistance={4}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
