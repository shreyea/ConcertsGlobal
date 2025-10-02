// src/components/BackgroundParticles.jsx
import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function BackgroundParticles({ id = "tsparticles-bg" }) {
  const particlesInit = async (engine) => {
    await loadFull(engine); // load tsparticles bundle
  };

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
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: { enable: false },
            onHover: { enable: false },
            resize: true,
          },
        },
        particles: {
          number: { value: 120, density: { enable: true, area: 1000 } },
          color: { value: ["#4a9eff", "#7dd3fc", "#fbbf24"] },
          links: {
            enable: false,
          },
          move: { 
            enable: true, 
            speed: 0.8, 
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" } 
          },
          opacity: { 
            value: 0.4,
            random: { enable: true, minimumValue: 0.1 },
            animation: { 
              enable: true, 
              speed: 1, 
              minimumValue: 0.1, 
              sync: false 
            }
          },
          shape: { type: "circle" },
          size: { 
            value: { min: 1, max: 3.5 },
            random: { enable: true, minimumValue: 0.5 }
          },
        },
        detectRetina: true,
      }}
    />
  );
}
