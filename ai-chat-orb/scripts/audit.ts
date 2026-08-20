/**
 * Lighthouse audit — performance (primary), accessibility, best practices.
 * Run: npm run audit
 *
 * Builds, serves via `vite preview`, runs Lighthouse through a puppeteer-driven
 * Chrome (GPU enabled so the WebGL core renders as it would for a real user),
 * prints category scores + the Core Web Vitals breakdown + every sub-90 audit
 * with the offending element selectors, and saves the full HTML + JSON report
 * under reports/.
 */

import { execSync, spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

const rootDir = path.resolve(import.meta.dirname!, '..');
const reportDir = path.join(rootDir, 'reports');

let server: ChildProcess;
let port = 4177;

function stopPreview() {
  if (!server?.pid) return;
  try {
    process.kill(-server.pid, 'SIGKILL');
  } catch {
    server.kill('SIGKILL');
  }
}

function startPreview(): Promise<string> {
  return new Promise((resolve) => {
    server = spawn('npm', ['run', 'preview', '--', '--port', String(port)], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: true,
    });
    server.stdout?.on('data', (data: Buffer) => {
      const m = data.toString().match(/https?:\/\/localhost:(\d+)/);
      if (m) {
        port = +m[1];
        resolve(`http://localhost:${port}`);
      }
    });
    setTimeout(() => resolve(`http://localhost:${port}`), 4000);
  });
}

async function runLighthouse(url: string) {
  const lighthouse = (await import('lighthouse')).default;
  const browser = await puppeteer.launch({
    headless: true,
    // GPU on so WebGL renders like it does for a real visitor.
    args: ['--no-sandbox', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=gl'],
  });

  const wsEndpoint = browser.wsEndpoint();
  const chromePort = +(wsEndpoint.match(/:(\d+)\//)?.[1] ?? 9222);

  console.log(`Running Lighthouse on ${url}...`);
  const result = await lighthouse(url, {
    port: chromePort,
    output: ['html', 'json'],
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });

  await Promise.race([browser.close(), new Promise((r) => setTimeout(r, 4000))]);
  return result;
}

// The headline Core Web Vitals / performance metrics, in display order.
const METRICS: Array<[id: string, label: string]> = [
  ['first-contentful-paint', 'First Contentful Paint'],
  ['largest-contentful-paint', 'Largest Contentful Paint'],
  ['total-blocking-time', 'Total Blocking Time'],
  ['cumulative-layout-shift', 'Cumulative Layout Shift'],
  ['speed-index', 'Speed Index'],
  ['interactive', 'Time to Interactive'],
];

async function main() {
  console.log('Building...');
  execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });

  const url = await startPreview();
  console.log(`Preview at ${url}`);

  try {
    const result = await runLighthouse(url);
    if (!result?.lhr) {
      console.error('Lighthouse failed to produce a report');
      stopPreview();
      process.exit(1);
    }
    const { lhr } = result;

    // ── Category scores ──────────────────────────────────────────────────
    console.log('\n═══ Lighthouse Scores ═══');
    for (const cat of Object.values(lhr.categories)) {
      const c = cat as { title: string; score: number | null };
      const score = c.score === null ? 0 : Math.round(c.score * 100);
      const filled = Math.floor(score / 5);
      const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);
      console.log(`  ${c.title.padEnd(18)} ${bar} ${score}`);
    }

    // ── Performance metrics ──────────────────────────────────────────────
    console.log('\n═══ Performance Metrics ═══');
    for (const [id, label] of METRICS) {
      const a = lhr.audits[id];
      if (!a) continue;
      const val = a.displayValue ?? '—';
      const score = a.score === null ? '   ' : `${Math.round(a.score * 100)}`.padStart(3);
      console.log(`  ${label.padEnd(26)} ${String(val).padStart(10)}   [${score}]`);
    }

    // ── Sub-90 audits, grouped by category, with element selectors ───────
    const failures: Array<{ cat: string; id: string; title: string; desc: string }> = [];
    for (const [catKey, cat] of Object.entries(lhr.categories)) {
      for (const ref of (cat as { auditRefs: Array<{ id: string }> }).auditRefs) {
        const audit = lhr.audits[ref.id];
        if (!audit || audit.score === null || audit.score >= 0.9) continue;
        failures.push({
          cat: catKey,
          id: ref.id,
          title: audit.title,
          desc: (audit.description ?? '').split('. ')[0],
        });
      }
    }

    if (failures.length) {
      console.log(`\n═══ Opportunities & Diagnostics (${failures.length}) ═══`);
      for (const f of failures) {
        const audit = lhr.audits[f.id];
        const items =
          (audit.details as { items?: Array<{ node?: { selector?: string } }> } | undefined)
            ?.items ?? [];
        const count = items.length ? ` (${items.length})` : '';
        console.log(`\n  ✗ [${f.cat}] ${f.id}: ${f.title}${count}`);
        if (f.desc) console.log(`    ${f.desc}.`);
        for (const it of items.slice(0, 6)) {
          if (it.node?.selector) console.log(`      • ${it.node.selector}`);
        }
      }
    } else {
      console.log('\n✓ No audits below 90.');
    }

    // ── Save full reports ────────────────────────────────────────────────
    fs.mkdirSync(reportDir, { recursive: true });
    const [html, json] = result.report as [string, string];
    fs.writeFileSync(path.join(reportDir, 'lighthouse.html'), html);
    fs.writeFileSync(path.join(reportDir, 'lighthouse.json'), json);
    console.log(`\nFull report → reports/lighthouse.html`);
  } finally {
    stopPreview();
  }
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  console.error(e);
  stopPreview();
  process.exit(1);
});
