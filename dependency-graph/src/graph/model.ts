import type { Dependency, PackageCategory, PackageNode, PackageSeed } from './types';

export type GraphSource = 'live' | 'sample';

export interface GraphModel {
  packages: PackageNode[];
  dependencies: Dependency[];
  byId: ReadonlyMap<string, PackageNode>;
  relatedMap: ReadonlyMap<string, ReadonlySet<string>>;
  /** Categories present in this graph — the filter bar only offers these */
  categories: ReadonlySet<PackageCategory>;
  /** Total vulnerability count across all packages */
  vulnCount: number;
  /** Direct dependencies that did not fit on the canvas */
  overflow: number;
  source: GraphSource;
}

const BASE_R = 24;
const MAX_R = 38;

export function buildGraphModel(
  seeds: readonly PackageSeed[],
  dependencies: Dependency[],
  opts: { source: GraphSource; overflow?: number },
): GraphModel {
  // Radius scales with log10 of weekly downloads, normalised within this graph
  const logs = seeds.map((s) => (s.downloads && s.downloads > 0 ? Math.log10(s.downloads) : null));
  const known = logs.filter((v): v is number => v !== null);
  const min = Math.min(...known);
  const span = Math.max(...known) - min;

  const packages: PackageNode[] = seeds.map((seed, i) => ({
    ...seed,
    r:
      logs[i] === null || span === 0
        ? BASE_R
        : Math.round(BASE_R + ((logs[i] - min) / span) * (MAX_R - BASE_R)),
  }));

  const relatedMap = new Map<string, Set<string>>(packages.map((p) => [p.id, new Set([p.id])]));
  for (const dep of dependencies) {
    relatedMap.get(dep.from)?.add(dep.to);
    relatedMap.get(dep.to)?.add(dep.from);
  }

  return {
    packages,
    dependencies,
    byId: new Map(packages.map((p) => [p.id, p])),
    relatedMap,
    categories: new Set(packages.map((p) => p.category)),
    vulnCount: packages.reduce((sum, p) => sum + (p.vulnCount ?? 0), 0),
    overflow: opts.overflow ?? 0,
    source: opts.source,
  };
}
