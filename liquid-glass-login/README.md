# Liquid glass login

A login card in the "liquid glass" style: frosted panels over an animated mesh-gradient background, with a highlight that follows your pointer across the glass.

![Liquid glass login demo](../docs/media/liquid-glass-login.gif)

[Live demo](https://karelmraz.github.io/ui-components/liquid-glass-login/)

## What it does

- A frosted login card (email, password with show/hide, remember toggle, social buttons) floating over drifting colour orbs and a breathing WebGL blob.
- Move the pointer and a soft specular highlight glides across the card and inputs; press the submit button for a springy loading → success sequence.
- Everything is keyboard-accessible; the demo never sends anything anywhere.

## How it's built

- React 18 + TypeScript (strict), Vite, Tailwind CSS v3, framer-motion.
- The pointer highlight never re-renders React: `useGlassHighlight` batches pointer events through one `requestAnimationFrame` and writes `--gx`/`--gy` CSS variables straight onto the highlight layer, which a `radial-gradient(... at var(--gx) var(--gy))` consumes.
- The glass itself is one `backdrop-filter` sample plus seven plain gradient/hairline layers — deliberately no `mix-blend-mode` or `mask-composite`, which flicker with backdrop-filter in several browsers. The card is promoted to its own compositor layer so the blur recomputes only for its fixed rect.
- The mesh background blurs each glow orb once as a static CSS filter on its own GPU layer and then animates only `transform`; a WebGL orb (simplex-noise silhouette with breathing petal harmonics, hover-reactive distortion) composites over it on a transparent canvas. The orb shader is adapted from [ReactBits' Orb](https://reactbits.dev) (MIT) — ported from OGL to raw WebGL, with the petal silhouette and background-luminance adaptation added.
- `webgl-liquid-glass/` is an archived experiment that renders the whole scene — background and refracting glass panels — in a two-pass WebGL pipeline (edge lensing, chromatic aberration, frost, specular). It is not built or imported; its README explains how to revive it.

Lighthouse on the production build (desktop): performance / accessibility / best practices / SEO = **100 / 100 / 100 / 100**.

## Running

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production bundle in dist/
npm run audit     # Lighthouse against the production build (uses puppeteer)
```

## Notes

The brand ("ember") and the pre-filled address are fictional demo content.
