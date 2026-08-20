import { getJson } from './http';
import type { RegistryManifest } from './npm';

const REGISTRY = 'https://registry.npmjs.org';
const DOWNLOADS = 'https://api.npmjs.org/downloads/point/last-week';

/** One package's latest manifest; null when the name isn't on the registry */
export async function fetchManifest(
  name: string,
  signal: AbortSignal,
): Promise<RegistryManifest | null> {
  const res = await fetch(`${REGISTRY}/${encodeURIComponent(name)}/latest`, { signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} from registry.npmjs.org`);
  return res.json() as Promise<RegistryManifest>;
}

/** Weekly downloads; the bulk endpoint takes up to 128 unscoped names, scoped ones go one by one */
export async function fetchDownloads(
  names: readonly string[],
  signal: AbortSignal,
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  const single = (name: string) =>
    getJson<{ downloads?: number }>(`${DOWNLOADS}/${encodeURIComponent(name)}`, signal)
      .then((r) => {
        if (r.downloads) out.set(name, r.downloads);
      })
      .catch(() => undefined); // downloads only size the nodes — a miss just means base radius

  const plain = names.filter((n) => !n.startsWith('@'));
  const jobs = names.filter((n) => n.startsWith('@')).map(single);
  if (plain.length === 1) {
    jobs.push(single(plain[0]));
  } else if (plain.length > 1) {
    jobs.push(
      getJson<Record<string, { downloads: number } | null>>(
        `${DOWNLOADS}/${plain.join(',')}`,
        signal,
      )
        .then((res) => {
          for (const [name, entry] of Object.entries(res)) {
            if (entry?.downloads) out.set(name, entry.downloads);
          }
        })
        .catch(() => undefined),
    );
  }
  await Promise.all(jobs);
  return out;
}
