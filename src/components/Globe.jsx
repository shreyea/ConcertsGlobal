import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

/* lat/lng -> xyz on sphere r */
function latLngToXYZ(lat, lng, r = 2.5) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

function Marker({ pos, onClick }) {
  return (
    <group position={pos}>
      <mesh onPointerDown={(e)=>{ e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#ffb347" emissive="#ff7a00" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

export default function Globe({ events = [], onMarkerClick = ()=>{}, onGlobeMouseDown = ()=>{}, onGlobeMouseUp = ()=>{} }) {
  const [texture, setTexture] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      "/earth_texture.jpg",
      (tex) => { if (mountedRef.current) setTexture(tex); },
      undefined,
      (err) => { console.warn("Texture load failed, using fallback color.", err); setTexture(null); }
    );
    return () => { mountedRef.current = false; };
  }, []);

  return (
    <div className="globe-area-60">
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true }}
        onCreated={({ gl, scene }) => {
          // Set a darker blue gradient background for the 3D scene
          const canvas = gl.domElement;
          canvas.style.background = 'linear-gradient(135deg, #23344a 0%, #1a2333 100%)';
          scene.background = null;
        }}
      >
        <ambientLight intensity={0.7}/>
        <directionalLight position={[5,5,5]} intensity={0.8}/>
        <Stars radius={100} depth={50} count={1200} factor={4.5} fade color="#3a5a7a" />
        <mesh
          rotation={[0, 0, 0]}
          onPointerDown={() => {
            onGlobeMouseDown();
            onMarkerClick(null);
          }}
          onPointerUp={() => {
            onGlobeMouseUp();
          }}
        >
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial map={texture ?? null} color={texture ? undefined : "#3a5a7a"} />
        </mesh>

        {Array.isArray(events) && events.map(ev => {
          // Accept both lat/lng and location from backend
          const lat = typeof ev.lat === "number" ? ev.lat : (ev.location?.lat ?? null);
          const lng = typeof ev.lng === "number" ? ev.lng : (ev.location?.lng ?? null);
          if (typeof lat !== "number" || typeof lng !== "number") return null;
          const pos = latLngToXYZ(lat, lng, 2);
          return <Marker key={ev.id} pos={pos} onClick={() => onMarkerClick(ev)} />;
        })}

        <OrbitControls enablePan={false} rotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}
