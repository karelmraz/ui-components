# Dependency graph

An npm dependency explorer with live data: type any package name and its direct dependency graph is fetched from the npm registry, sized by weekly downloads, checked against the OSV vulnerability database, and laid out on the canvas — with version, licence, unpacked size and download counts one click away.

![Dependency graph](../docs/media/dependency-graph.png)

[Live demo](https://karelmraz.github.io/ui-components/dependency-graph/)

## What it does

- Search any npm package; the graph shows it with up to 16 of its direct dependencies (ranked by weekly downloads, the rest counted as "+N more"). Edges are derived from the fetched manifests, so dependencies between dependencies show up too.
- Click a package to highlight its neighbours and open a detail panel with live registry data and a link to npmjs.com; hover for a tooltip; filter by (keyword-derived) category or by "issues".
- Packages with known OSV advisories are flagged with their worst severity; the footer counts advisories across the graph.
- While a new search is in flight the previous graph stays on screen; already-viewed packages come back instantly from cache. A package with no runtime dependencies, a name that isn't on the registry, and an unreachable registry each get their own state — the last one offers a labeled sample dataset as a fallback.
- Dark and light themes.

## How it's built

- React 19 + TypeScript (strict), Vite, Tailwind CSS v4, TanStack Query, CSS keyframes + SVG. Vitest covers the pure logic (26 tests).
- Data comes from three keyless public APIs: `registry.npmjs.org` (manifests), `api.npmjs.org` (weekly downloads, bulk where possible) and `api.osv.dev` (advisories, batch query + a capped set of detail lookups). Each API has its own module under `src/graph/`; `fetchGraph.ts` runs them as a pipeline, and every request takes an `AbortSignal` so a new search cancels the old one. TanStack Query adds caching, retries (skipped for not-found) and stale-while-revalidate.
- Layout is a deterministic pure function (`src/graph/layout.ts`): root top-centre, dependencies in rows with index-derived jitter. Tests assert bounds, minimum node spacing and determinism — for a root-plus-direct-deps view this beats a force simulation, which earns its complexity only on deeper topologies.
- Nodes are positioned by percentage on a dot-grid canvas with `ResizeObserver`-driven bezier edges that fan out along the source node's rim, a per-graph adjacency map for neighbour highlighting, portal tooltips and memoised nodes.
- `scripts/check-contrast.ts` parses `src/theme.ts`, computes WCAG contrast ratios for every foreground/background pair (compositing rgba over the page background), reports the failures, and with `--fix` binary-searches each failing colour's lightness until it passes AA and writes it back.
- `scripts/audit.ts` builds the app, serves it, runs Lighthouse through puppeteer and prints the scores; `--fix` feeds contrast failures back into the checker.

## Running

```bash
npm install
npm run dev
npm run test           # Vitest: layout, categorisation, data mapping, graph model
npm run lint
npm run build
npm run contrast       # WCAG AA check of src/theme.ts   (contrast:fix to auto-adjust)
npm run audit          # Lighthouse on the production build (uses puppeteer)
```
