import { describe, expect, it } from 'vitest';
import { layoutGraph } from './layout';

const ids = (n: number) => ['root', ...Array.from({ length: n }, (_, i) => `dep-${i}`)];

describe('layoutGraph', () => {
  it('places the root top-center', () => {
    const pos = layoutGraph(ids(6));
    expect(pos.get('root')).toEqual({ x: 50, y: 14 });
  });

  it('keeps every node inside the canvas margins', () => {
    for (const n of [0, 1, 4, 9, 16]) {
      for (const [, p] of layoutGraph(ids(n))) {
        expect(p.x).toBeGreaterThanOrEqual(8);
        expect(p.x).toBeLessThanOrEqual(92);
        expect(p.y).toBeGreaterThanOrEqual(10);
        expect(p.y).toBeLessThanOrEqual(90);
      }
    }
  });

  it('is deterministic for the same input', () => {
    expect(layoutGraph(ids(12))).toEqual(layoutGraph(ids(12)));
  });

  it('never puts two nodes closer than 10 units, up to a full graph of 17', () => {
    for (const n of [3, 8, 16]) {
      const points = [...layoutGraph(ids(n)).values()];
      for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
          const d = Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y);
          expect(d).toBeGreaterThanOrEqual(10);
        }
      }
    }
  });

  it('lays out a dependency-less package as a single root node', () => {
    const pos = layoutGraph(['react']);
    expect(pos.size).toBe(1);
    expect(pos.get('react')).toEqual({ x: 50, y: 14 });
  });
});
