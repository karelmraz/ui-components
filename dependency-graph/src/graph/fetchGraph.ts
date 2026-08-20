import type { PackageSeed } from './types';
import { layoutGraph, MAX_GRAPH_DEPS } from './layout';
import { buildGraphModel, type GraphModel } from './model';
import { deriveEdges, manifestToSeed, type RegistryManifest } from './npm';
import { fetchDownloads, fetchManifest } from './registry';
import { fetchVulns } from './osv';

export class PackageNotFoundError extends Error {
  constructor(name: string) {
    super(`"${name}" is not on the npm registry`);
    this.name = 'PackageNotFoundError';
  }
}

/**
 * The whole live pipeline: manifest of the root, manifests of its direct deps,
 * weekly downloads (ranks which deps stay under the cap and sizes the nodes),
 * OSV advisories, then layout into a renderable graph model.
 */
export async function fetchGraph(name: string, signal: AbortSignal): Promise<GraphModel> {
  const root = await fetchManifest(name.trim(), signal);
  if (!root) throw new PackageNotFoundError(name.trim());

  // Dep names are known from the root manifest alone, so the downloads request
  // runs concurrently with the per-dep manifest fetches instead of after them.
  const depNames = Object.keys(root.dependencies ?? {}).filter((d) => d !== root.name);
  const downloadsPromise = fetchDownloads([root.name, ...depNames], signal);
  const depManifests = (
    await Promise.all(depNames.map((d) => fetchManifest(d, signal).catch(() => null)))
  ).filter((m): m is RegistryManifest => m !== null);
  const downloads = await downloadsPromise;

  const kept = depManifests
    .sort((a, b) => (downloads.get(b.name) ?? 0) - (downloads.get(a.name) ?? 0))
    .slice(0, MAX_GRAPH_DEPS);

  const manifests = new Map<string, RegistryManifest>([root, ...kept].map((m) => [m.name, m]));
  const vulns = await fetchVulns(
    [...manifests.values()].map((m) => ({ name: m.name, version: m.version })),
    signal,
  );

  const ids = [root.name, ...kept.map((m) => m.name)];
  const positions = layoutGraph(ids);
  const seeds: PackageSeed[] = ids.map((id) => {
    const vuln = vulns.get(id);
    return {
      ...manifestToSeed(manifests.get(id)!, id === root.name),
      ...positions.get(id)!,
      downloads: downloads.get(id),
      vulnerability: vuln?.severity ?? 'none',
      vulnCount: vuln?.count,
    };
  });

  const depsById = new Map(
    [...manifests].map(([id, m]) => [id, Object.keys(m.dependencies ?? {})]),
  );
  return buildGraphModel(seeds, deriveEdges(depsById), {
    source: 'live',
    overflow: depNames.length - kept.length,
  });
}
