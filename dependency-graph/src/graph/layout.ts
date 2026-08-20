export interface LayoutPoint {
  x: number;
  y: number;
}

const ROOT: LayoutPoint = { x: 50, y: 14 };
const PER_ROW = 4;

/** Row centres tuned for the 9/14 canvas; index = row count - 1 */
const ROW_YS = [[58], [42, 72], [36, 60, 84], [34, 51, 68, 85]];

/** How many dependencies the canvas can hold — a property of the row geometry above */
export const MAX_GRAPH_DEPS = ROW_YS.length * PER_ROW;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Deterministic positions (percentages) for a root package and its dependencies.
 * ids[0] is the root; the rest are laid out in rows below it, in input order.
 */
export function layoutGraph(ids: readonly string[]): Map<string, LayoutPoint> {
  const pos = new Map<string, LayoutPoint>();
  if (ids.length === 0) return pos;
  pos.set(ids[0], { ...ROOT });

  const rest = ids.slice(1);
  const rowYs = ROW_YS[Math.ceil(rest.length / PER_ROW) - 1] ?? ROW_YS[ROW_YS.length - 1];

  let i = 0;
  for (const y of rowYs) {
    const count = Math.min(PER_ROW, rest.length - i);
    const slot = Math.min(24, 84 / count);
    for (let j = 0; j < count; j++, i++) {
      // Small index-derived jitter so rows read as a scatter, not a grid
      const jx = ((i * 29) % 9) - 4;
      const jy = ((i * 17) % 7) - 3;
      pos.set(rest[i], {
        x: clamp(50 + (j - (count - 1) / 2) * slot + jx, 8, 92),
        y: clamp(y + jy, 10, 90),
      });
    }
  }
  return pos;
}
