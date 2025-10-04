import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useState } from 'react';
import { OrbitControls, Stars, Html } from "@react-three/drei";

function SmallGlobe({ size = 56 }) {
  const globeRef = useRef();
  const starRef = useRef();
  const ringRef = useRef();
  const ringGlowRef = useRef();
  const ringStarRef = useRef();
  const ringSparkRef = useRef();
  const highlightRef = useRef();

  const [texture, setTexture] = useState(null);
  const [texLoaded, setTexLoaded] = useState(false);

  // progressive load: low-res first, then high-res replacement for fast visible paint
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let mounted = true;
    const lowRes = "/earth_texture1.jpg";
    const highRes = "/earth_latlong_texture.png";

    loader.load(lowRes, (lowTex) => {
      if (!mounted) return;
      try {
        lowTex.wrapS = THREE.RepeatWrapping;
        lowTex.wrapT = THREE.ClampToEdgeWrapping;
        lowTex.repeat.x = 1;
        lowTex.anisotropy = 4;
        lowTex.encoding = THREE.sRGBEncoding;
        lowTex.generateMipmaps = false;
        lowTex.needsUpdate = true;
        setTexture(lowTex);
        setTexLoaded(true);
      } catch (e) {}

      // then load high-res and swap in
      loader.load(highRes, (hiTex) => {
        if (!mounted) return;
        try {
          hiTex.wrapS = THREE.RepeatWrapping;
          hiTex.wrapT = THREE.ClampToEdgeWrapping;
          hiTex.anisotropy = Math.min(16, hiTex.anisotropy || 8);
          hiTex.encoding = THREE.sRGBEncoding;
          hiTex.generateMipmaps = true;
          hiTex.needsUpdate = true;
          setTexture(hiTex);
          setTexLoaded(true);
        } catch (e) {}
      }, undefined, (err) => { console.warn('[GlobeLogoSmall] hi-res load failed', err); });
    }, undefined, (err) => {
      console.warn('[GlobeLogoSmall] low-res load failed', err);
      // fallback to high-res directly
      loader.load(highRes, (hiTex) => {
        if (!mounted) return;
        hiTex.wrapS = THREE.RepeatWrapping;
        hiTex.wrapT = THREE.ClampToEdgeWrapping;
        hiTex.encoding = THREE.sRGBEncoding;
        hiTex.needsUpdate = true;
        setTexture(hiTex);
        setTexLoaded(true);
      }, undefined, (err2) => { console.warn('[GlobeLogoSmall] high-res also failed', err2); setTexLoaded(false); });
    });

    return () => { mounted = false; };
  }, []);

  // ensure texture uses correct color space and filtering for display in small canvas
  useEffect(() => {
    if (!texture) return;
    try {
      texture.encoding = THREE.sRGBEncoding;
      texture.anisotropy = Math.min(16, texture.anisotropy || 8);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
    } catch (e) {
      // ignore
    }
  }, [texture]);

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.2; // slow rotate
    }
    if (ringRef.current) {
      // rotate ring slowly around globe
      ringRef.current.rotation.y += delta * 0.32;
    }
    if (ringGlowRef.current) {
      // gentle pulse for the glow rim
      const g = 0.16 + Math.sin(state.clock.getElapsedTime() * 1.1) * 0.03;
      ringGlowRef.current.material.opacity = Math.max(0.04, g);
    }
    if (ringSparkRef.current) {
      const ta = state.clock.getElapsedTime() * 1.8;
      const r = 1.15;
      // orbit spark around ring in local ring coordinates
      ringSparkRef.current.position.x = Math.cos(ta) * r;
      ringSparkRef.current.position.z = Math.sin(ta) * r ;//* 0.12;
      ringSparkRef.current.position.y = 0;//Math.sin(ta * 2.2) * 0.04;
      ringSparkRef.current.material.emissiveIntensity = 1.2 + Math.sin(ta * 6) * 0.6;
    }
    if (ringStarRef.current) {
      // small local pulse for star sitting on ring
      const tt = state.clock.getElapsedTime();
      const ss = 1 + Math.sin(tt * 6.5) * 0.2;
      ringStarRef.current.scale.set(ss, ss, ss);
    }
    if (starRef.current) {
      // shimmer the star (scale pulse)
      const t = state.clock.getElapsedTime();
      const s = 1 + Math.sin(t * 6) * 0.18;
      starRef.current.scale.set(s, s, s);
      // slight orbit around globe
     // starRef.current.position.x = Math.cos(t * 0.9) * 0.9 + 1.1;
     // starRef.current.position.y = Math.sin(t * 0.9) * 0.35 + 0.25;
    }

    if (highlightRef.current) {
      const t2 = state.clock.getElapsedTime() * 1.6;
      highlightRef.current.position.x = Math.cos(t2) * 1.2;
      highlightRef.current.position.y = Math.sin(t2 * 0.6) * 0.4 + 0.2;
      highlightRef.current.position.z = Math.sin(t2) * 0.3 + 0.1;
    }
  });

  return (
    <group>
      <group ref={globeRef} rotation={[0, 0, 0]}>
        {texLoaded ? (
          <mesh>
            {/* lower subdivisions for navbar performance */}
            <sphereGeometry args={[0.85, 32, 32]} />
            <meshStandardMaterial 
              map={texture} 
              metalness={0.18} 
              roughness={0.52} 
              emissive="#001018" 
              emissiveIntensity={0.7}
              transparent
              opacity={0.93}
            />
          </mesh>
        ) : (
          // fallback visual: deep ocean color with a faint cloud layer so it reads like a globe
          <>
            <mesh>
              <sphereGeometry args={[0.85, 32, 32]} />
              <meshStandardMaterial color="#06324a" metalness={0.08} roughness={0.7} emissive="#001318" emissiveIntensity={0.04} transparent opacity={0.93} />
            </mesh>
          
          </>
        )}

        {/* subtle rim */}
        <mesh>
          <sphereGeometry args={[0.855, 32, 32]} />
          <meshBasicMaterial color="rgba(255,255,255,0.02)" transparent depthWrite={false} />
        </mesh>
      </group>

      {/* orbital ring around the globe */}
  <group ref={ringRef} className="globe-orbit-rotate" rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.15, 0.015, 16, 64]} />
          <meshStandardMaterial 
            color="#033f83ff" 
            emissive="#023168ff" 
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* soft glow rim slightly larger than the torus */}
        <mesh ref={ringGlowRef} rotation={[0, 0, 0]}> 
          <torusGeometry args={[1.165, 0.02, 16, 64]} />
          <meshBasicMaterial color="#1a69c3ff" transparent opacity={0.08} depthWrite={false} />
        </mesh>
        {/* small star pinned on the ring */}
        <mesh ref={ringStarRef} position={[1.15, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#fff1a8" emissive="#ffd76b" emissiveIntensity={1.6} />
        </mesh>
        {/* moving spark that orbits along the ring */}
        <mesh ref={ringSparkRef} position={[1.15, 2, 15]}> 
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#fff7d9" emissive="#fff7d9" emissiveIntensity={8} metalness={0.2} roughness={0.1} transparent />
        </mesh>
      </group>

      {/* shimmering star to the right */}
      <mesh ref={starRef} position={[1, -1, 0]}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshStandardMaterial color="#ffd76b" emissive="#ffd76b" emissiveIntensity={1.6} />
      </mesh>
       
      {/* small moving highlight light to add specular pop */}
      <pointLight ref={highlightRef} color={0xffffff} intensity={1} distance={3} decay={2} />
    </group>
  );
}

export default function GlobeLogoSmall({ size = 56 }) {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(typeof window !== 'undefined' ? window.innerWidth <= 600 : false);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // lower DPR and disable antialias on small screens to save GPU/CPU
  const dprProp = isSmall ? [1, 1.25] : [1, 2];
  const glSettings = { antialias: !isSmall };

  return (
    <div className="nav-logo nav-logo-size" style={{ display: 'inline-block' }}>
      <Canvas
        className="nav-logo-canvas"
        camera={{ position: [0, 0, 3.2], fov: 40 }}
        dpr={dprProp}
        gl={glSettings}
        onCreated={({ gl }) => { gl.outputEncoding = THREE.sRGBEncoding; console.debug('[GlobeLogoSmall] gl outputEncoding set', gl.outputEncoding); }}
      >
        <ambientLight intensity={1} />
        <hemisphereLight skyColor={0xbfdfff} groundColor={0x101820} intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[2, -1, 2]} intensity={1} />
        <SmallGlobe />
      </Canvas>
    </div>
  );
}
