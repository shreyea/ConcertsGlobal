import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useState } from 'react';
import { OrbitControls, Stars, Html } from "@react-three/drei";
function SmallGlobe({ size = 56 }) {
  const globeRef = useRef();
  const starRef = useRef();
  const ringRef = useRef();
  const highlightRef = useRef();

  const [texture, setTexture] = useState(null);
  const [texLoaded, setTexLoaded] = useState(false);

  // load texture with explicit callbacks so we can detect failures
  useEffect(() => {
    const url = "/earth_latlong_texture.png";
    const loader = new THREE.TextureLoader();
    let mounted = true;
    loader.load(
      url,
      (tex) => {
        if (mounted) {
                  tex.wrapS = THREE.RepeatWrapping;
                  tex.wrapT = THREE.ClampToEdgeWrapping;
                  tex.repeat.x = 1;
                  tex.offset.x = 0;
                  tex.anisotropy = 12;
                  tex.encoding = THREE.sRGBEncoding;
                  tex.needsUpdate = true;
                  setTexture(tex);
                  setTexLoaded(true);
                  console.debug('[GlobeLogoSmall] texture loaded (success)', url, tex.image && { width: tex.image.width, height: tex.image.height });
                }
              },
      undefined,
      (err) => {
        console.warn('[GlobeLogoSmall] failed to load texture', url, err);
        setTexLoaded(false);
      }
    );
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
      globeRef.current.rotation.y += delta * 0.15; // slow rotate
    }
    if (ringRef.current) {
      // rotate ring slowly around globe
      ringRef.current.rotation.z += delta * 0.32;
    }
    if (starRef.current) {
      // shimmer the star (scale pulse)
      const t = state.clock.getElapsedTime();
      const s = 1 + Math.sin(t * 6) * 0.18;
      starRef.current.scale.set(s, s, s);
      // slight orbit around globe
      starRef.current.position.x = Math.cos(t * 0.9) * 0.9 + 1.1;
      starRef.current.position.y = Math.sin(t * 0.9) * 0.35 + 0.25;
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
            <meshStandardMaterial map={texture} metalness={0.15} roughness={0.6} emissive="#001018" emissiveIntensity={1} />
          </mesh>
        ) : (
          // fallback visual: deep ocean color with a faint cloud layer so it reads like a globe
          <>
            <mesh>
              <sphereGeometry args={[0.85, 32, 32]} />
              <meshStandardMaterial color="#06324a" metalness={0.05} roughness={0.7} emissive="#001318" emissiveIntensity={0.02} />
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
      <group ref={ringRef} className="globe-orbit-rotate" rotation={[Math.PI / 2.2, 0, Math.PI / 6]}>
        <mesh>
          <torusGeometry args={[1.15, 0.015, 16, 64]} />
          <meshStandardMaterial 
            color="#4a9eff" 
            emissive="#2a7edf" 
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* shimmering star to the right */}
      <mesh ref={starRef} position={[1.1, 0.25, 0.2]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffd76b" emissive="#ffd76b" emissiveIntensity={1.6} />
      </mesh>

      {/* small moving highlight light to add specular pop */}
      <pointLight ref={highlightRef} color={0xffffff} intensity={0.6} distance={3} decay={2} />
    </group>
  );
}

export default function GlobeLogoSmall({ size = 56 }) {
  return (
    <div className="nav-logo nav-logo-size" style={{ display: 'inline-block' }}>
      <Canvas
        className="nav-logo-canvas"
        camera={{ position: [0, 0, 3.2], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
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
