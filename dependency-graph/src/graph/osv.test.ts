import { describe, expect, it } from 'vitest';
import { maxSeverity } from './osv';

describe('maxSeverity', () => {
  it('takes the worst OSV severity label across advisories', () => {
    expect(maxSeverity(['HIGH', 'MODERATE'])).toBe('high');
    expect(maxSeverity(['LOW', 'CRITICAL'])).toBe('critical');
    expect(maxSeverity(['MODERATE'])).toBe('moderate');
    expect(maxSeverity([])).toBe('none');
  });

  it('treats unknown or missing labels as moderate rather than hiding them', () => {
    expect(maxSeverity(['SOMETHING_NEW'])).toBe('moderate');
    expect(maxSeverity([undefined])).toBe('moderate');
  });
});
