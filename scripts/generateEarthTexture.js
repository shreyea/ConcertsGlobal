import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { createCanvas } from "canvas";
import {
  geoEquirectangular,
  geoPath,
  geoGraticule
} from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const land110m = require("world-atlas/land-110m.json");
const countries110m = require("world-atlas/countries-110m.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const width = 4096;
const height = 2048;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");

// Background ocean gradient
const gradient = ctx.createLinearGradient(0, 0, 0, height);
gradient.addColorStop(0, "#03172e");
gradient.addColorStop(0.5, "#063b5b");
gradient.addColorStop(1, "#02111f");
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

const projection = geoEquirectangular()
  .translate([width / 2, height / 2])
  .scale(width / (2 * Math.PI))
  .precision(0.1);

const pathGenerator = geoPath(projection, ctx);

// Subtle day-night vignette to add depth
const radialGradient = ctx.createRadialGradient(
  width * 0.35,
  height * 0.4,
  width * 0.2,
  width * 0.5,
  height * 0.5,
  width * 0.9
);
radialGradient.addColorStop(0, "rgba(255,255,255,0.18)");
radialGradient.addColorStop(0.6, "rgba(0,0,0,0)");
radialGradient.addColorStop(1, "rgba(0,0,0,0.45)");
ctx.fillStyle = radialGradient;
ctx.fillRect(0, 0, width, height);

// Draw land masses
const land = feature(land110m, land110m.objects.land);
ctx.fillStyle = "#2c9d77";
ctx.beginPath();
pathGenerator(land);
ctx.fill();

// Add coastal highlights
ctx.strokeStyle = "rgba(255,255,255,0.18)";
ctx.lineWidth = 1.2;
ctx.beginPath();
pathGenerator(land);
ctx.stroke();

// Draw country borders for location context
const countries = feature(countries110m, countries110m.objects.countries);
ctx.strokeStyle = "rgba(255,255,255,0.08)";
ctx.lineWidth = 0.6;
ctx.beginPath();
pathGenerator(countries);
ctx.stroke();

// Draw graticule for latitude/longitude reference
const graticule = geoGraticule().step([15, 15]);
ctx.strokeStyle = "rgba(255,255,255,0.17)";
ctx.lineWidth = 0.7;
ctx.beginPath();
pathGenerator(graticule());
ctx.stroke();

// Emphasize Equator, Tropics, Arctic/Antarctic circles
const emphasisLines = [
  { lat: 0, opacity: 0.35 },
  { lat: 23.5, opacity: 0.25 },
  { lat: -23.5, opacity: 0.25 },
  { lat: 66.5, opacity: 0.18 },
  { lat: -66.5, opacity: 0.18 }
];
ctx.lineWidth = 1.4;
emphasisLines.forEach(({ lat, opacity }) => {
  const coords = [
    [ -180, lat ],
    [ 180, lat ]
  ];
  ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
  ctx.beginPath();
  pathGenerator({ type: "LineString", coordinates: coords });
  ctx.stroke();
});

// Prime meridian & International Date Line emphasis
ctx.lineWidth = 1.4;
ctx.strokeStyle = "rgba(255,255,255,0.28)";
ctx.beginPath();
pathGenerator({ type: "LineString", coordinates: [[0, -90], [0, 90]] });
ctx.stroke();
ctx.strokeStyle = "rgba(255,255,255,0.22)";
ctx.setLineDash([8, 8]);
ctx.beginPath();
pathGenerator({ type: "LineString", coordinates: [[180, -90], [180, 90]] });
ctx.stroke();
ctx.setLineDash([]);

const outputPath = path.join(__dirname, "../public/earth_latlong_texture.png");
fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

console.log(`Generated Earth texture with latitude/longitude grid at ${outputPath}`);
