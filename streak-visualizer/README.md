# Streak visualizer

A habit-tracking dashboard in the style of Duolingo streaks and GitHub's contribution graph. Everything is interactive: click a day and the streak, stats and milestones recompute on the spot.

![Streak visualizer demo](../docs/media/streak-visualizer.gif)

[Live demo](https://karelmraz.github.io/ui-components/streak-visualizer/)

## What it does

- A big animated streak counter, a current / longest / total stats row, a seven-day strip for this week and a 15-week heatmap with five intensity levels plus "streak freeze" days.
- Clicking a heatmap or weekly cell cycles its intensity; the current streak, longest streak and total are derived from the data, never stored separately.
- A milestone track (3 → 7 → 14 → 30 → 50 → 100 → 365 days). Crossing one triggers a full-screen celebration overlay that can be dismissed with <kbd>Esc</kbd>, a click outside, or the button — focus is moved in and restored afterwards.
- Dark and light themes with an animated sun/moon switch (`role="switch"`).

## How it's built

- React 19 + TypeScript (strict), Vite, Tailwind CSS v4, framer-motion.
- Domain logic is plain TypeScript with no React in it: streak maths, intensity cycling and milestone detection in `src/data.ts`, the heatmap grid layout in `src/calendar.ts`. It's covered by Vitest (`npm test`), and the demo data is generated relative to today so it never goes stale.
- `App` only composes three hooks — `useTheme`, `useStreakData` (entries + derived stats) and `useMilestoneCelebration` — and side effects live in event handlers, not in state updaters or effects.
- Each visual block is its own component (`StreakCounter`, `StatsRow`, `WeeklyProgress`, `CalendarHeatmap` + `HeatmapCell`, `MilestoneTrack`, `CelebrationOverlay`); the page mounts through a staggered framer-motion variant cascade. The ~100 heatmap cells are memoised so hovering re-renders only the two cells that changed.
- Tooltips work on hover and on tap and are wired through `aria-describedby`; every animation is disabled under `prefers-reduced-motion`.

Lighthouse on the production build (desktop): performance / accessibility / best practices / SEO = **100 / 100 / 100 / 100**.

## Running

```bash
npm install
npm run dev
npm test          # vitest
npm run lint
npm run build
```
