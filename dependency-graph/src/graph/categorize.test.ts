import { describe, expect, it } from 'vitest';
import { categorize } from './categorize';

describe('categorize', () => {
  it('always marks the root package as core', () => {
    expect(categorize('express', ['framework', 'web'], true)).toBe('core');
  });

  it('classifies test tooling from keywords', () => {
    expect(categorize('supertest', ['test', 'http'], false)).toBe('testing');
  });

  it('classifies css packages from keywords or name', () => {
    expect(categorize('postcss', [], false)).toBe('styling');
    expect(categorize('some-pkg', ['css', 'colors'], false)).toBe('styling');
  });

  it('classifies build and lint tooling', () => {
    expect(categorize('eslint', ['lint'], false)).toBe('tooling');
    expect(categorize('esbuild', ['bundler'], false)).toBe('tooling');
  });

  it('classifies frameworks', () => {
    expect(categorize('next', ['framework', 'react'], false)).toBe('framework');
  });

  it('falls back to utility when nothing matches, or keywords are missing', () => {
    expect(categorize('accepts', ['http'], false)).toBe('utility');
    expect(categorize('etag', undefined, false)).toBe('utility');
  });

  it('prefers the more specific bucket when keywords overlap', () => {
    // "react testing" keywords: testing wins over framework
    expect(categorize('@testing-library/react', ['testing', 'react'], false)).toBe('testing');
  });
});
