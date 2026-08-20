/**
 * Full Lighthouse audit + auto-fix script
 * Run: npx tsx scripts/audit.ts [--fix]
 *
 * 1. Builds the project
 * 2. Starts a preview server
 * 3. Runs Lighthouse (accessibility, performance, best practices)
 * 4. Reports all failures
 * 5. With --fix: auto-fixes contrast issues in theme.ts
 */

import { execSync, spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import type { Result as LighthouseResult } from 'lighthouse';

const fix = process.argv.includes('--fix');
const rootDir = path.resolve(import.meta.dirname!, '..');
const themePath = path.join(rootDir, 'src/theme.ts');

type AuditDetails = LighthouseResult['audits'][string]['details'];

/** One row of the `color-contrast` audit table. Lighthouse types table cells loosely, so name the fields we read. */
interface ContrastRow {
  node?: { snippet?: string; explanation?: string };
  ratio?: number;
  expectedContrastRatio?: number;
}

function contrastRows(details: AuditDetails): ContrastRow[] {
  return details?.type === 'table' ? (details.items as ContrastRow[]) : [];
}

// ── Color utilities for auto-fix ──

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
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
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
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

function adjustForContrast(fgHex: string, bgHex: string, target: number): string {
  const fg = parseHex(fgHex);
  const bg = parseHex(bgHex);
  if (!fg || !bg) return fgHex;
  const fgLum = luminance(...fg);
  const bgLum = luminance(...bg);
  const lighter = fgLum > bgLum;

  let lo = 0,
    hi = 1,
    best = fgHex;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    const adj = fg.map((c) =>
      lighter ? Math.round(c + (255 - c) * mid) : Math.round(c * (1 - mid)),
    ) as [number, number, number];
    if (contrastRatio(adj, bg) >= target) {
      best = rgbToHex(...adj);
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return best;
}

// ── Build & serve ──

console.log('Building...');
execSync('npx vite build', { cwd: rootDir, stdio: 'pipe' });

let server: ChildProcess;
let port = 4174;

function startPreview(): Promise<string> {
  return new Promise((resolve) => {
    server = spawn('npx', ['vite', 'preview', '--port', String(port)], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    server.stdout?.on('data', (data: Buffer) => {
      const line = data.toString();
      const m = line.match(/https?:\/\/localhost:(\d+)/);
      if (m) {
        port = +m[1];
        resolve(`http://localhost:${port}`);
      }
    });

    // Fallback
    setTimeout(() => resolve(`http://localhost:${port}`), 3000);
  });
}

// ── Run Lighthouse via puppeteer ──

async function runLighthouse(url: string) {
  const lighthouse = (await import('lighthouse')).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const wsEndpoint = browser.wsEndpoint();
  const portMatch = wsEndpoint.match(/:(\d+)\//);
  const chromePort = portMatch ? +portMatch[1] : 9222;

  console.log(`Running Lighthouse on ${url}...`);

  const result = await lighthouse(url, {
    port: chromePort,
    output: 'json',
    onlyCategories: ['accessibility', 'performance', 'best-practices'],
  });

  await browser.close();
  return result;
}

// ── Main ──

async function main() {
  const url = await startPreview();
  console.log(`Preview at ${url}`);

  try {
    const result = await runLighthouse(url);
    if (!result?.lhr) {
      console.error('Lighthouse failed');
      process.exit(1);
    }

    const { lhr } = result;

    // Print scores
    console.log('\n═══ Lighthouse Scores ═══');
    for (const cat of Object.values(lhr.categories)) {
      const score = Math.round((cat.score ?? 0) * 100);
      const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
      console.log(`  ${cat.title.padEnd(20)} ${bar} ${score}`);
    }

    // Collect failures
    const failures: Array<{ id: string; title: string; description: string; category: string }> =
      [];
    const contrastFailures: Array<{ fg: string; bg: string; ratio: number; needed: number }> = [];

    for (const [catKey, cat] of Object.entries(lhr.categories)) {
      for (const ref of cat.auditRefs) {
        const audit = lhr.audits[ref.id];
        if (!audit || audit.score === null || audit.score >= 0.9) continue;
        failures.push({
          id: ref.id,
          title: audit.title,
          description: audit.description?.slice(0, 120) ?? '',
          category: catKey,
        });

        // Extract contrast details
        if (ref.id === 'color-contrast') {
          for (const item of contrastRows(audit.details)) {
            if (item.node?.snippet) {
              contrastFailures.push({
                fg: item.node.explanation?.match(/foreground color: ([^,]+)/)?.[1] ?? '',
                bg: item.node.explanation?.match(/background color: ([^,]+)/)?.[1] ?? '',
                ratio: item.ratio ?? 0,
                needed: item.expectedContrastRatio ?? 4.5,
              });
            }
          }
        }
      }
    }

    if (failures.length > 0) {
      console.log(`\n═══ Failures (${failures.length}) ═══`);
      for (const f of failures) {
        console.log(`  ✗ [${f.category}] ${f.title}`);
        if (f.description) console.log(`    ${f.description}`);
      }
    } else {
      console.log('\n✓ All audits passed!');
    }

    // Auto-fix contrast if --fix
    if (fix && contrastFailures.length > 0) {
      console.log('\n═══ Auto-fixing contrast ═══');
      let source = fs.readFileSync(themePath, 'utf-8');
      let fixCount = 0;

      for (const cf of contrastFailures) {
        const fgHex = cf.fg.startsWith('#') ? cf.fg : null;
        const bgHex = cf.bg.startsWith('#') ? cf.bg : null;
        if (!fgHex || !bgHex) continue;

        const fixed = adjustForContrast(fgHex, bgHex, cf.needed + 0.3);
        if (fixed !== fgHex && source.includes(`'${fgHex}'`)) {
          source = source.replace(`'${fgHex}'`, `'${fixed}'`);
          console.log(`  ${fgHex} → ${fixed} (was ${cf.ratio.toFixed(1)}:1, need ${cf.needed}:1)`);
          fixCount++;
        }
      }

      if (fixCount > 0) {
        fs.writeFileSync(themePath, source);
        console.log(`\n✓ Fixed ${fixCount} color(s) in theme.ts`);
        console.log('  Run again to verify fixes');
      }
    }

    // Also run the static contrast checker
    console.log('\n═══ Static contrast check ═══');
    try {
      execSync(`npx tsx scripts/check-contrast.ts ${fix ? '--fix' : ''}`, {
        cwd: rootDir,
        stdio: 'inherit',
      });
    } catch {
      // Non-zero exit = failures found
    }
  } finally {
    server?.kill();
  }
}

main().catch((e) => {
  console.error(e);
  server?.kill();
  process.exit(1);
});
