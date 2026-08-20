# Spotify clone

A mobile music-player UI rendered inside an iPhone-sized frame: home, search, library, playlist detail and a full Now Playing screen with a 3D album carousel you can drag.

![Spotify clone demo](../docs/media/spotify-clone.gif)

[Live demo](https://karelmraz.github.io/ui-components/spotify-clone/)

## What it does

- Five screens (Home, Search, Library, Playlist, Now Playing) with spring-animated transitions and a bottom tab bar; a mini-player slides in over the other screens while something is playing.
- A small playback engine drives elapsed time, seek, next/previous, shuffle, repeat and "like" without any audio — enough to make every control feel real.
- The Now Playing screen has a drag-to-swipe 3D carousel of album art; the backdrop is a per-track gradient that cross-fades over 1.5 s when the track changes, with an animated equaliser while playing.
- Horizontal lists scroll with mouse drag as well as touch (`useDragScroll`).

## How it's built

- React 19 + TypeScript (strict), Vite, Tailwind CSS v4, framer-motion.
- `src/screens/` holds one component per screen; `src/components/` holds the reusable pieces (phone frame, carousel, artwork with graceful fallback, playlist mosaic, progress bar, equaliser, mini-player, status bar, …); `src/data/` holds the track and playlist fixtures.
- Playback is a single `usePlayback()` hook: the current / next / next-next queue is one state object and the 250 ms tick reads the latest state through `useEffectEvent`, so `App.tsx` is left with navigation only and the Now Playing screen takes one `playback` prop instead of a pile of booleans and callbacks. The queue arithmetic itself lives in `src/playbackQueue.ts`, a pure module with an injectable random source and a Vitest suite.
- The carousel drives five cards from one framer-motion `MotionValue` via `useTransform` ranges (position, scale, rotateY, opacity, z-index), so dragging never re-renders React; next/previous reuse the same spring and swap the queue exactly when the animation lands.
- Artwork loading is centralised in one component (shimmer → fade-in → letter fallback on error, eager loading for above-the-fold covers) and reused by thumbnails, carousel cards and playlist mosaics.

Lighthouse on the production build (desktop): performance / accessibility / best practices / SEO = **98 / 100 / 100 / 100**.

## Running

```bash
npm install
npm run dev       # http://localhost:5173
npm run test      # Vitest: playback queue logic
npm run lint
npm run build     # production bundle in dist/
npm run audit     # Lighthouse against the production build (uses puppeteer)
```

## Notes

This is a UI study, not affiliated with or endorsed by Spotify. Album artwork is loaded from Apple's public iTunes artwork CDN purely for demonstration; all rights belong to their respective owners.
