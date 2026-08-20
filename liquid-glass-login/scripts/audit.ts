/**
 * Lighthouse audit (accessibility, performance, best practices)
 * Run: npm run audit
 *
 * Builds, serves via vite preview, and runs Lighthouse through puppeteer.
 * Color/contrast accessibility is covered by Lighthouse's own `color-contrast`
 * audit — this project styles via inline Tailwind tokens, so there is no
 * central theme file to statically check.
 */

import { execSync, spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import puppeteer from 'puppeteer';

const rootDir = path.resolve(import.meta.dirname!, '..');

console.log('Building...');
execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });

let server: ChildProcess;
let port = 4175;

function startPreview(): Promise<string> {
  return new Promise((resolve) => {
    server = spawn('npm', ['run', 'preview', '--', '--port', String(port)], {
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

    setTimeout(() => resolve(`http://localhost:${port}`), 4000);
  });
}

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

    console.log('\n═══ Lighthouse Scores ═══');
    for (const [, cat] of Object.entries(lhr.categories)) {
      const score = Math.round((cat as { score: number }).score * 100);
      const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
      console.log(`  ${(cat as { title: string }).title.padEnd(20)} ${bar} ${score}`);
    }

    const failures: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      items: number;
    }> = [];

    for (const [catKey, cat] of Object.entries(lhr.categories)) {
      for (const ref of (cat as { auditRefs: Array<{ id: string }> }).auditRefs) {
        const audit = lhr.audits[ref.id];
        if (!audit || audit.score === null || audit.score >= 0.9) continue;
        const details = audit.details as { items?: unknown[] } | undefined;
        failures.push({
          id: ref.id,
          title: audit.title,
          description: audit.description?.slice(0, 200) ?? '',
          category: catKey,
          items: details?.items?.length ?? 0,
        });
      }
    }

    if (failures.length > 0) {
      console.log(`\n═══ Failures (${failures.length}) ═══`);
      for (const f of failures) {
        console.log(
          `  ✗ [${f.category}] ${f.id}: ${f.title}${f.items ? ` (${f.items} element(s))` : ''}`,
        );
        if (f.description) console.log(`    ${f.description}`);
        // Dump offending element selectors for actionable audits.
        const audit = lhr.audits[f.id];
        const items = (
          audit.details as
            { items?: Array<{ node?: { selector?: string; snippet?: string } }> } | undefined
        )?.items;
        if (items?.length) {
          for (const it of items.slice(0, 8)) {
            if (it.node?.selector) console.log(`      • ${it.node.selector}`);
          }
        }
      }
      process.exitCode = 1;
    } else {
      console.log('\n✓ All audits passed!');
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
