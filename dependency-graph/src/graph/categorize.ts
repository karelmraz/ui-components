import type { PackageCategory } from './types';

/** Checked in order — the first match wins, so the more specific buckets come first */
const BUCKETS: Array<[PackageCategory, RegExp]> = [
  ['testing', /\b(test|testing|jest|vitest|mocha|assert|spec|coverage)\b/],
  ['styling', /\b(css|style|styles|styling|sass|less|postcss|tailwind|autoprefixer)\b/],
  [
    'tooling',
    /\b(lint|linter|eslint|bundler|bundle|build|compiler|transpiler|typescript|babel|cli|minifier|formatter)\b/,
  ],
  ['framework', /\b(framework|next|nuxt|remix|astro|ssr|angular|vue|svelte)\b/],
];

/**
 * Best-effort bucket from the package name and registry keywords.
 * Heuristic by nature — npm has no category field — so unknowns land in "utility".
 */
export function categorize(
  name: string,
  keywords: readonly string[] | undefined,
  isRoot: boolean,
): PackageCategory {
  if (isRoot) return 'core';
  const haystack = [name, ...(keywords ?? [])].join(' ').toLowerCase();
  for (const [category, pattern] of BUCKETS) {
    if (pattern.test(haystack)) return category;
  }
  return 'utility';
}
