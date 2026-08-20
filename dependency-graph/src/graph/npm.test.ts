import { describe, expect, it } from 'vitest';
import {
  deriveEdges,
  formatBytes,
  formatDownloads,
  manifestToSeed,
  type RegistryManifest,
} from './npm';

const manifest = (over: Partial<RegistryManifest>): RegistryManifest => ({
  name: 'demo',
  version: '1.0.0',
  ...over,
});

describe('formatBytes', () => {
  it('formats byte counts the way npm does (decimal units)', () => {
    expect(formatBytes(890)).toBe('890 B');
    expect(formatBytes(6_400)).toBe('6.4 kB');
    expect(formatBytes(137_000)).toBe('137 kB');
    expect(formatBytes(5_200_000)).toBe('5.2 MB');
    expect(formatBytes(22_000_000)).toBe('22 MB');
  });
});

describe('formatDownloads', () => {
  it('formats weekly download counts compactly', () => {
    expect(formatDownloads(950)).toBe('950/wk');
    expect(formatDownloads(42_000)).toBe('42k/wk');
    expect(formatDownloads(3_200_000)).toBe('3.2M/wk');
    expect(formatDownloads(109_000_000)).toBe('109M/wk');
  });
});

describe('manifestToSeed', () => {
  it('maps the registry manifest onto a graph node seed', () => {
    const seed = manifestToSeed(
      manifest({
        name: 'accepts',
        version: '2.0.0',
        description: 'Higher-level content negotiation',
        license: 'MIT',
        dependencies: { negotiator: '^1.0.0', 'mime-types': '^3.0.0' },
        dist: { unpackedSize: 6_400 },
      }),
      false,
    );
    expect(seed).toMatchObject({
      id: 'accepts',
      name: 'accepts',
      version: '2.0.0',
      license: 'MIT',
      size: '6.4 kB',
      category: 'utility',
      vulnerability: 'none',
      dependencies: ['negotiator', 'mime-types'],
    });
  });

  it('normalizes object-shaped licenses and missing fields', () => {
    const seed = manifestToSeed(
      manifest({ name: 'oldpkg', license: { type: 'Apache-2.0' } as RegistryManifest['license'] }),
      false,
    );
    expect(seed.license).toBe('Apache-2.0');
    expect(seed.size).toBeUndefined();
    expect(seed.description).toBe('');
    expect(seed.dependencies).toEqual([]);
  });

  it('truncates marathon descriptions at a word boundary', () => {
    const seed = manifestToSeed(manifest({ description: `${'word '.repeat(40)}end` }), false);
    expect(seed.description.length).toBeLessThanOrEqual(100);
    expect(seed.description.endsWith('…')).toBe(true);
    expect(seed.description).not.toMatch(/\swor…$/);
  });
});

describe('deriveEdges', () => {
  it('keeps only edges where both ends are in the graph', () => {
    const deps = new Map<string, readonly string[]>([
      ['express', ['accepts', 'qs', 'unresolved']],
      ['accepts', ['negotiator']],
      ['qs', []],
    ]);
    expect(deriveEdges(deps)).toEqual([
      { from: 'express', to: 'accepts' },
      { from: 'express', to: 'qs' },
    ]);
  });
});
