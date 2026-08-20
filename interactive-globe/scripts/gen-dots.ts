/**
 * Precompute the globe geometry data from world-atlas (110m) + d3-geo:
 *   - src/globe/land-dots.json  — flat [lng, lat, ...] of on-land dot samples
 *   - src/globe/coastlines.json — array of rings, each a flat [lng, lat, ...],
 *     the boundary mesh of all land (drawn as coastline outline strokes)
 * Both are committed so the app has zero runtime/network cost.
 *
 * Run: npm run gen:dots
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { geoContains } from 'd3-geo';
import { feature, mesh } from 'topojson-client';

const require = createRequire(import.meta.url);
const world = require('world-atlas/land-110m.json');
const land = feature(world, world.objects.land) as unknown as GeoJSON.Feature;

/* ── dotted land ──────────────────────────────────────────────────────── */
/** Degrees between latitude rings; also sets in-ring spacing. Higher = sparser
 *  (dot count scales ~1/STEP²). Coastline outlines carry the continent shape,
 *  so the interior fill can stay light. */
const STEP = 1.7;

const dots: number[] = [];
for (let lat = -84; lat <= 84; lat += STEP) {
  const ringRadius = Math.cos((lat * Math.PI) / 180);
  const count = Math.max(1, Math.round((360 / STEP) * ringRadius));
  for (let i = 0; i < count; i++) {
    const lng = (i / count) * 360 - 180;
    if (geoContains(land, [lng, lat])) {
      dots.push(Math.round(lng * 10) / 10, Math.round(lat * 10) / 10);
    }
  }
}

const dotsOut = path.resolve(import.meta.dirname!, '../src/globe/land-dots.json');
fs.writeFileSync(dotsOut, JSON.stringify(dots));
console.log(`wrote ${dots.length / 2} land dots -> ${path.relative(process.cwd(), dotsOut)}`);

/* ── coastline outlines ───────────────────────────────────────────────── */
// The boundary mesh of the land object: every coastline as a MultiLineString.
const coast = mesh(world, world.objects.land) as GeoJSON.MultiLineString;

// Densify long segments so each chord stays close to the sphere surface (no
// visible cut-through on wide coastline spans), and round to trim file size.
const round = (n: number) => Math.round(n * 100) / 100;
const rings: number[][] = coast.coordinates.map((line) => {
  const out: number[] = [];
  for (let i = 0; i < line.length; i++) {
    const [lng, lat] = line[i];
    if (i > 0) {
      const [plng, plat] = line[i - 1];
      const dist = Math.hypot(lng - plng, lat - plat);
      const sub = Math.floor(dist / 2); // one extra point per ~2° of gap
      for (let s = 1; s <= sub; s++) {
        const t = s / (sub + 1);
        out.push(round(plng + (lng - plng) * t), round(plat + (lat - plat) * t));
      }
    }
    out.push(round(lng), round(lat));
  }
  return out;
});

const coastOut = path.resolve(import.meta.dirname!, '../src/globe/coastlines.json');
fs.writeFileSync(coastOut, JSON.stringify(rings));
const pts = rings.reduce((n, r) => n + r.length / 2, 0);
console.log(
  `wrote ${rings.length} coastline rings (${pts} points) -> ${path.relative(process.cwd(), coastOut)}`,
);
