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
    loader.load(
      "/earth_latlong_texture.png",
      (tex) => { 
        if (mountedRef.current) {
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.repeat.x = 1;
          tex.offset.x = 0;
          tex.anisotropy = 12;
          tex.needsUpdate = true;
          setTexture(tex);
        }
      },
      undefined,
      (err) => { console.warn("Texture load failed", err); setTexture(null); }
    );
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

  const handleActivate = () => {
    onGlobeActivate();
  };
  useEffect(() => {
  if (!isActive) {
    onGlobeDeactivate();
  }
}, [isActive, onGlobeDeactivate]);


  return (
    <div
      className={`globe-area-60 ${isActive ? 'globe-fullscreen' : ''} ${containerClassName}`.trim()}
      onClick={handleActivate}
      role="presentation"
    >
  <Canvas className="globe-canvas" camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={1}/>
        <directionalLight position={[5,5,5]} intensity={0.7}/>
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
