/**
 * Automated WCAG AA contrast checker for theme.ts
 * Run: npx tsx scripts/check-contrast.ts [--fix]
 *
 * Reads both themes, checks all text-on-background pairs,
 * reports failures, and optionally auto-fixes by adjusting colors.
 */

import fs from 'node:fs';
import path from 'node:path';

// ── Color math ──

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function parseRgba(str: string): { r: number; g: number; b: number; a: number } | null {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
}

function resolveColor(color: string, bgHex: string): [number, number, number] | null {
  // Hex color
  const hex = parseHex(color);
  if (hex) return hex;

  // rgba — blend over background
  const rgba = parseRgba(color);
  if (rgba) {
    const bg = parseHex(bgHex);
    if (!bg) return null;
    const a = rgba.a;
    return [
      Math.round(rgba.r * a + bg[0] * (1 - a)),
      Math.round(rgba.g * a + bg[1] * (1 - a)),
      Math.round(rgba.b * a + bg[2] * (1 - a)),
    ];
  }
  return null;
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = luminance(...fg);
  const l2 = luminance(...bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((c) =>
        Math.max(0, Math.min(255, Math.round(c)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

/** Lighten or darken a hex color to meet target contrast against bg */
function adjustForContrast(fgHex: string, bgHex: string, targetRatio: number): string {
  const fg = parseHex(fgHex);
  const bg = parseHex(bgHex);
  if (!fg || !bg) return fgHex;

  const bgLum = luminance(...bg);
  const fgLum = luminance(...fg);
  const needsLighter = fgLum > bgLum; // fg is lighter than bg (dark theme)

  // Binary search for the right adjustment
  let lo = 0,
    hi = 1;
  let bestHex = fgHex;

  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    let adjusted: [number, number, number];

    if (needsLighter) {
      // Lighten: blend toward white
      adjusted = fg.map((c) => Math.round(c + (255 - c) * mid)) as [number, number, number];
    } else {
      // Darken: blend toward black
      adjusted = fg.map((c) => Math.round(c * (1 - mid))) as [number, number, number];
    }

    const ratio = contrastRatio(adjusted, bg);
    if (ratio >= targetRatio) {
      bestHex = rgbToHex(...adjusted);
      hi = mid; // try less adjustment
    } else {
      lo = mid; // need more adjustment
    }
  }

  return bestHex;
}

// ── Theme parsing ──

interface ThemeColors {
  [key: string]: string;
}

function extractThemes(source: string): Record<string, ThemeColors> {
  const themes: Record<string, ThemeColors> = {};
  // Match theme objects: dark: { ... }, light: { ... }
  const themeRegex = /(\w+):\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
  let match;

  while ((match = themeRegex.exec(source)) !== null) {
    const name = match[1];
    if (name === 'dark' || name === 'light') {
      const body = match[2];
      const colors: ThemeColors = {};
      const propRegex = /(\w+):\s*'([^']+)'/g;
      let prop;
      while ((prop = propRegex.exec(body)) !== null) {
        colors[prop[1]] = prop[2];
      }
      themes[name] = colors;
    }
  }
  return themes;
}

// ── Contrast pairs to check ──

const TEXT_BG_PAIRS: Array<{ text: string; bg: string; label: string; minRatio: number }> = [
  // Text on card
  { text: 'textPrimary', bg: 'cardBg', label: 'Primary text on card', minRatio: 7 },
  { text: 'textSecondary', bg: 'cardBg', label: 'Secondary text on card', minRatio: 4.5 },
  { text: 'textMuted', bg: 'cardBg', label: 'Muted text on card', minRatio: 4.5 },
  // Text on canvas
  { text: 'textPrimary', bg: 'canvasBg', label: 'Primary text on canvas', minRatio: 7 },
  { text: 'textSecondary', bg: 'canvasBg', label: 'Secondary text on canvas', minRatio: 4.5 },
  { text: 'textMuted', bg: 'canvasBg', label: 'Muted text on canvas', minRatio: 4.5 },
  // Badge text
  { text: 'badgeText', bg: 'cardBg', label: 'Badge text on card', minRatio: 4.5 },
  { text: 'outdatedText', bg: 'cardBg', label: 'Outdated text on card', minRatio: 4.5 },
  // Vuln text
  { text: 'vulnCriticalText', bg: 'cardBg', label: 'Critical vuln text', minRatio: 4.5 },
  { text: 'vulnHighText', bg: 'cardBg', label: 'High vuln text', minRatio: 4.5 },
  { text: 'vulnModerateText', bg: 'cardBg', label: 'Moderate vuln text', minRatio: 4.5 },
  { text: 'vulnNoneText', bg: 'cardBg', label: 'Clean vuln text', minRatio: 4.5 },
  // Category colors on canvas (used as icon color)
  { text: 'catCore', bg: 'canvasBg', label: 'Core category on canvas', minRatio: 3 },
  { text: 'catFramework', bg: 'canvasBg', label: 'Framework category on canvas', minRatio: 3 },
  { text: 'catStyling', bg: 'canvasBg', label: 'Styling category on canvas', minRatio: 3 },
  { text: 'catTooling', bg: 'canvasBg', label: 'Tooling category on canvas', minRatio: 3 },
  { text: 'catTesting', bg: 'canvasBg', label: 'Testing category on canvas', minRatio: 3 },
  { text: 'catUtility', bg: 'canvasBg', label: 'Utility category on canvas', minRatio: 3 },
  // Category colors on card (detail bar text)
  { text: 'catCore', bg: 'cardBg', label: 'Core category on card', minRatio: 4.5 },
  { text: 'catFramework', bg: 'cardBg', label: 'Framework category on card', minRatio: 4.5 },
  { text: 'catStyling', bg: 'cardBg', label: 'Styling category on card', minRatio: 4.5 },
  { text: 'catTooling', bg: 'cardBg', label: 'Tooling category on card', minRatio: 4.5 },
  { text: 'catTesting', bg: 'cardBg', label: 'Testing category on card', minRatio: 4.5 },
  { text: 'catUtility', bg: 'cardBg', label: 'Utility category on card', minRatio: 4.5 },
];

// pageBg text on colored backgrounds (active filter buttons use pageBg as text color)
const PAGEBG_ON_BG_PAIRS: Array<{ bg: string; label: string; minRatio: number }> = [
  { bg: 'accent', label: 'pageBg on accent (All button)', minRatio: 4.5 },
  { bg: 'catCore', label: 'pageBg on Core filter', minRatio: 4.5 },
  { bg: 'catFramework', label: 'pageBg on Framework filter', minRatio: 4.5 },
  { bg: 'catStyling', label: 'pageBg on Styling filter', minRatio: 4.5 },
  { bg: 'catTooling', label: 'pageBg on Tooling filter', minRatio: 4.5 },
  { bg: 'catTesting', label: 'pageBg on Testing filter', minRatio: 4.5 },
  { bg: 'catUtility', label: 'pageBg on Utility filter', minRatio: 4.5 },
];

// ── Main ──

const fix = process.argv.includes('--fix');
const themePath = path.resolve(import.meta.dirname!, '../src/theme.ts');
let source = fs.readFileSync(themePath, 'utf-8');
const themes = extractThemes(source);

let hasFailures = false;
const fixes: Array<{ theme: string; key: string; oldVal: string; newVal: string }> = [];

for (const [themeName, colors] of Object.entries(themes)) {
  console.log(`\n── ${themeName} theme ──`);

  for (const pair of TEXT_BG_PAIRS) {
    const fgRaw = colors[pair.text];
    const bgRaw = colors[pair.bg];
    if (!fgRaw || !bgRaw) continue;

    const bgHex = parseHex(bgRaw) ? bgRaw : null;
    if (!bgHex) continue;

    const fg = resolveColor(fgRaw, bgHex);
    const bg = parseHex(bgHex);
    if (!fg || !bg) continue;

    const ratio = contrastRatio(fg, bg);
    const pass = ratio >= pair.minRatio;
    const icon = pass ? '✓' : '✗';
    const ratioStr = ratio.toFixed(1);

    if (!pass) {
      hasFailures = true;
      console.log(
        `  ${icon} ${pair.label}: ${ratioStr}:1 (need ${pair.minRatio}:1) — ${pair.text}: ${fgRaw}`,
      );

      // Only auto-fix hex colors
      if (fix && parseHex(fgRaw)) {
        const fixed = adjustForContrast(fgRaw, bgHex, pair.minRatio + 0.3); // +0.3 margin
        const newRatio = contrastRatio(parseHex(fixed)!, bg);
        console.log(`    → fixed to ${fixed} (${newRatio.toFixed(1)}:1)`);
        fixes.push({ theme: themeName, key: pair.text, oldVal: fgRaw, newVal: fixed });
      }
    } else {
      console.log(`  ${icon} ${pair.label}: ${ratioStr}:1`);
    }
  }

  // pageBg as text on colored backgrounds (active filter buttons)
  console.log('  ── active filter buttons (pageBg on bg) ──');
  const pageBgRaw = colors['pageBg'];
  const pageBgRgb = pageBgRaw ? parseHex(pageBgRaw) : null;
  if (pageBgRgb) {
    for (const pair of PAGEBG_ON_BG_PAIRS) {
      const bgRaw = colors[pair.bg];
      if (!bgRaw) continue;
      const bg = parseHex(bgRaw);
      if (!bg) continue;

      const ratio = contrastRatio(pageBgRgb, bg);
      const pass = ratio >= pair.minRatio;
      const icon = pass ? '✓' : '✗';

      if (!pass) {
        hasFailures = true;
        console.log(
          `  ${icon} ${pair.label}: ${ratio.toFixed(1)}:1 (need ${pair.minRatio}:1) — ${pair.bg}: ${bgRaw}`,
        );

        if (fix && parseHex(bgRaw)) {
          // Darken the bg to increase contrast with pageBg
          let lo = 0,
            hi = 1,
            bestHex = bgRaw;
          for (let i = 0; i < 30; i++) {
            const mid = (lo + hi) / 2;
            const adj = bg.map((c) => Math.round(c * (1 - mid))) as [number, number, number];
            if (contrastRatio(pageBgRgb, adj) >= pair.minRatio + 0.3) {
              bestHex = rgbToHex(...adj);
              hi = mid;
            } else {
              lo = mid;
            }
          }
          const newRatio = contrastRatio(pageBgRgb, parseHex(bestHex)!);
          console.log(`    → fixed to ${bestHex} (${newRatio.toFixed(1)}:1)`);
          fixes.push({ theme: themeName, key: pair.bg, oldVal: bgRaw, newVal: bestHex });
        }
      } else {
        console.log(`  ${icon} ${pair.label}: ${ratio.toFixed(1)}:1`);
      }
    }
  }
}

// Apply fixes
if (fix && fixes.length > 0) {
  // Dedupe: if same key fixed multiple times, use the highest-contrast fix
  const deduped = new Map<string, (typeof fixes)[0]>();
  for (const f of fixes) {
    const k = `${f.theme}:${f.key}`;
    deduped.set(k, f);
  }

  for (const f of deduped.values()) {
    // Replace in the correct theme block
    const oldEntry = `${f.key}: '${f.oldVal}'`;
    const newEntry = `${f.key}: '${f.newVal}'`;
    // Find the theme block and replace within it
    const themeStart = source.indexOf(`${f.theme}: {`);
    const themeEnd = source.indexOf('},', themeStart);
    const before = source.slice(0, themeStart);
    const block = source.slice(themeStart, themeEnd);
    const after = source.slice(themeEnd);
    source = before + block.replace(oldEntry, newEntry) + after;
  }

  fs.writeFileSync(themePath, source);
  console.log(`\n✓ Applied ${deduped.size} fix(es) to theme.ts`);
} else if (fix) {
  console.log('\n✓ No fixes needed');
}

if (hasFailures && !fix) {
  console.log('\nRun with --fix to auto-adjust failing colors');
  process.exit(1);
}
