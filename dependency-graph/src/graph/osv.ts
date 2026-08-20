import type { VulnSeverity } from './types';
import { getJson } from './http';

const OSV = 'https://api.osv.dev/v1';

const SEVERITY_RANK: Record<VulnSeverity, number> = { none: 0, moderate: 1, high: 2, critical: 3 };

/** Worst severity across a package's advisories; unknown labels surface as moderate, never as clean */
export function maxSeverity(labels: ReadonlyArray<string | undefined>): VulnSeverity {
  let worst: VulnSeverity = 'none';
  for (const label of labels) {
    const mapped: VulnSeverity =
      label === 'CRITICAL' ? 'critical' : label === 'HIGH' ? 'high' : 'moderate';
    if (SEVERITY_RANK[mapped] > SEVERITY_RANK[worst]) worst = mapped;
  }
  return worst;
}

/** Advisory detail lookups per graph, so one vulnerable tree can't stampede OSV */
const MAX_ADVISORY_LOOKUPS = 8;

interface OsvBatchResponse {
  results: Array<{ vulns?: Array<{ id: string }> }>;
}
interface OsvVuln {
  database_specific?: { severity?: string };
}

/** Known advisories per package from OSV; severity comes from a capped set of detail lookups */
export async function fetchVulns(
  targets: ReadonlyArray<{ name: string; version: string }>,
  signal: AbortSignal,
): Promise<Map<string, { count: number; severity: VulnSeverity }>> {
  const out = new Map<string, { count: number; severity: VulnSeverity }>();
  const batch = await getJson<OsvBatchResponse>(`${OSV}/querybatch`, signal, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queries: targets.map((t) => ({
        package: { ecosystem: 'npm', name: t.name },
        version: t.version,
      })),
    }),
  }).catch(() => null);
  if (!batch) return out; // advisories are additive info — the graph still renders without them

  const ids = [...new Set(batch.results.flatMap((r) => (r.vulns ?? []).map((v) => v.id)))].slice(
    0,
    MAX_ADVISORY_LOOKUPS,
  );
  const labels = new Map<string, string | undefined>();
  await Promise.all(
    ids.map((id) =>
      getJson<OsvVuln>(`${OSV}/vulns/${id}`, signal)
        .then((v) => labels.set(id, v.database_specific?.severity))
        .catch(() => undefined),
    ),
  );

  batch.results.forEach((result, i) => {
    const vulns = result.vulns ?? [];
    if (vulns.length === 0) return;
    out.set(targets[i].name, {
      count: vulns.length,
      severity: maxSeverity(vulns.map((v) => labels.get(v.id))),
    });
  });
  return out;
}
