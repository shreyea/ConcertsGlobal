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
        zIndex: -1,
        pointerEvents: "none", // prevent accidental interaction glitches
      }}
      options={{
        background: { color: { value: "#8ea3bfff" } }, // soft, minimal dark
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: { enable: false },
            onHover: { enable: false },
            resize: true,
          },
        },
        particles: {
          number: { value: 60, density: { enable: true, area: 900 } }, // fewer particles
          color: { value: "#62a4eeff" }, // soft gray
          links: {
            enable: false,
          },
          move: { enable: true, speed: 0.5, outModes: { default: "out" } },
          opacity: { value: 0.18 }, // very subtle
          shape: { type: "circle" },
          size: { value: { min: 1, max: 2.2 } },
        },
        detectRetina: true,
      }}
    />
  );
}
