// src/components/BackgroundParticles.jsx
import React, { useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function BackgroundParticles({ id = "tsparticles-bg" }) {
  const [options, setOptions] = useState(null);

  const particlesInit = async (engine) => {
    await loadFull(engine); // load tsparticles bundle
  };

  useEffect(() => {
    const computeOptions = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const reduced = typeof window !== 'undefined' ? window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
      const deviceMemory = typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? navigator.deviceMemory : 4;

      // base counts (reduced overall to avoid visual clutter and improve perf)
      let count = 80;
      let speed = 0.6;
      let fps = 60;

      if (reduced) {
        // Minimal motion for accessibility
        count = 20;
        speed = 0.2;
        fps = 30;
      } else if (width < 480) {
        // tiny screens: very few particles
        count = 12;
        speed = 0.25;
        fps = 30;
      } else if (width < 900) {
        // tablets / small laptops: modest count
        count = 36;
        speed = 0.45;
        fps = 45;
      }

      // device memory heuristic: cap particles on low-memory devices
      if (deviceMemory && deviceMemory <= 1.5) {
        count = Math.min(count, 18);
      }

      // DPR heuristic: reduce on very dense displays
      if (dpr > 2 && width < 900) {
        count = Math.min(count, 24);
      }

      setOptions({
        background: { color: { value: "transparent" } },
        fpsLimit: fps,
        interactivity: {
          events: {
            onClick: { enable: false },
            onHover: { enable: false },
            resize: true,
          },
        },
        particles: {
          number: { value: count, density: { enable: true, area: 1000 } },
          color: { value: ["#4a9eff", "#7dd3fc", "#fbbf24"] },
          links: { enable: false },
          move: {
            enable: true,
            speed: speed,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
          },
          opacity: {
            value: 0.36,
            random: { enable: true, minimumValue: 0.06 },
            animation: {
              enable: !reduced,
              speed: reduced ? 0.2 : 0.8,
              minimumValue: 0.05,
              sync: false,
            },
          },
          shape: { type: "circle" },
          size: {
            value: { min: 0.8, max: 2.2 },
            random: { enable: true, minimumValue: 0.4 },
          },
        },
        detectRetina: true,
      });
    };

    computeOptions();

    const onResize = () => {
      // slight debounce
      clearTimeout(window.__tgResize);
      window.__tgResize = setTimeout(computeOptions, 120);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', onResize);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onResize);
        clearTimeout(window.__tgResize);
      }
    };
  }, []);

  // Render nothing until options are computed to avoid flashing large particle sets
  if (!options) return null;

  return (
    <Particles
      id={id}
      init={particlesInit}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
      options={options}
    />
  );
}
