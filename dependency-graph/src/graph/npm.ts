import type { Dependency, PackageSeed } from './types';
import { categorize } from './categorize';

/** The subset of a registry.npmjs.org `/{name}/latest` document this app reads */
export interface RegistryManifest {
  name: string;
  version: string;
  description?: string;
  license?: string | { type?: string };
  keywords?: string[];
  dependencies?: Record<string, string>;
  dist?: { unpackedSize?: number };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  const [unit, divisor] = bytes < 1e6 ? (['kB', 1e3] as const) : (['MB', 1e6] as const);
  const value = bytes / divisor;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${unit}`;
}

export function formatDownloads(count: number): string {
  if (count >= 1e6)
    return `${count < 1e7 ? (count / 1e6).toFixed(1) : Math.round(count / 1e6)}M/wk`;
  if (count >= 1e3) return `${Math.round(count / 1e3)}k/wk`;
  return `${count}/wk`;
}

const MAX_DESC = 90;

function truncate(text: string): string {
  if (text.length <= MAX_DESC) return text;
  const cut = text.slice(0, MAX_DESC);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

export function manifestToSeed(m: RegistryManifest, isRoot: boolean): PackageSeed {
  return {
    id: m.name,
    name: m.name,
    version: m.version,
    description: truncate(m.description ?? ''),
    category: categorize(m.name, m.keywords, isRoot),
    x: 0,
    y: 0,
    dependencies: Object.keys(m.dependencies ?? {}),
    vulnerability: 'none',
    license: typeof m.license === 'string' ? m.license : (m.license?.type ?? '—'),
    size: m.dist?.unpackedSize !== undefined ? formatBytes(m.dist.unpackedSize) : undefined,
  };
}

/** Edges between packages in the graph only — anything else has no node to point at */
export function deriveEdges(depsById: ReadonlyMap<string, readonly string[]>): Dependency[] {
  const edges: Dependency[] = [];
  for (const [id, deps] of depsById) {
    for (const dep of deps) {
      if (dep !== id && depsById.has(dep)) edges.push({ from: id, to: dep });
    }
  }
  return edges;
}
