import { describe, expect, it } from 'vitest';
import type { Dependency, PackageSeed } from './types';
import { buildGraphModel } from './model';

const seed = (id: string, over: Partial<PackageSeed> = {}): PackageSeed => ({
  id,
  name: id,
  version: '1.0.0',
  description: '',
  category: 'utility',
  x: 50,
  y: 50,
  dependencies: [],
  vulnerability: 'none',
  license: 'MIT',
  ...over,
});

const EDGES: Dependency[] = [
  { from: 'a', to: 'b' },
  { from: 'a', to: 'c' },
];

describe('buildGraphModel', () => {
  it('exposes id lookup and neighbour sets for selection highlighting', () => {
    const model = buildGraphModel([seed('a'), seed('b'), seed('c')], EDGES, { source: 'live' });
    expect(model.byId.get('b')?.id).toBe('b');
    expect(model.relatedMap.get('a')).toEqual(new Set(['a', 'b', 'c']));
    expect(model.relatedMap.get('b')).toEqual(new Set(['b', 'a']));
  });

  it('totals vulnerability counts across packages', () => {
    const model = buildGraphModel(
      [
        seed('a', { vulnerability: 'high', vulnCount: 2 }),
        seed('b', { vulnerability: 'moderate', vulnCount: 1 }),
        seed('c'),
      ],
      EDGES,
      { source: 'live' },
    );
    expect(model.vulnCount).toBe(3);
  });

  it('sizes node radii by weekly downloads within bounds, largest first', () => {
    const model = buildGraphModel(
      [
        seed('a', { downloads: 1_000 }),
        seed('b', { downloads: 90_000_000 }),
        seed('c', { downloads: 40_000 }),
      ],
      EDGES,
      { source: 'live' },
    );
    const [a, b, c] = ['a', 'b', 'c'].map((id) => model.byId.get(id)!.r);
    expect(b).toBeGreaterThan(c);
    expect(c).toBeGreaterThan(a);
    for (const r of [a, b, c]) {
      expect(r).toBeGreaterThanOrEqual(24);
      expect(r).toBeLessThanOrEqual(38);
    }
  });

  it('falls back to the base radius when downloads are unknown', () => {
    const model = buildGraphModel([seed('a')], [], { source: 'sample' });
    expect(model.byId.get('a')!.r).toBe(24);
  });

  it('collects the categories present in the graph', () => {
    const model = buildGraphModel(
      [
        seed('a', { category: 'core' }),
        seed('b', { category: 'testing' }),
        seed('c', { category: 'testing' }),
      ],
      EDGES,
      { source: 'live' },
    );
    expect(model.categories).toEqual(new Set(['core', 'testing']));
  });

  it('carries the overflow count for capped graphs', () => {
    const model = buildGraphModel([seed('a')], [], { source: 'live', overflow: 12 });
    expect(model.overflow).toBe(12);
  });
});
