/**
 * Lighthouse audit script for spotify-clone
 * Run: npx tsx scripts/audit.ts
 */

import { execSync, spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import puppeteer from 'puppeteer'

const rootDir = path.resolve(import.meta.dirname!, '..')

console.log('Building...')
execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' })

let server: ChildProcess
let port = 4175

function startPreview(): Promise<string> {
  return new Promise((resolve) => {
    server = spawn('npx', ['vite', 'preview', '--port', String(port)], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    server.stdout?.on('data', (data: Buffer) => {
      const line = data.toString()
      const m = line.match(/https?:\/\/localhost:(\d+)/)
      if (m) {
        port = +m[1]
        resolve(`http://localhost:${port}`)
      }
    })
    setTimeout(() => resolve(`http://localhost:${port}`), 3000)
  })
}

async function runLighthouse(url: string) {
  const lighthouse = (await import('lighthouse')).default
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  })

  const wsEndpoint = browser.wsEndpoint()
  const portMatch = wsEndpoint.match(/:(\d+)\//)
  const chromePort = portMatch ? +portMatch[1] : 9222

  console.log(`Running Lighthouse on ${url}...`)

  const result = await lighthouse(url, {
    port: chromePort,
    output: 'json',
    onlyCategories: ['accessibility', 'performance', 'best-practices', 'seo'],
  })

  await browser.close()
  return result
}

async function main() {
  const url = await startPreview()
  console.log(`Preview at ${url}`)

  try {
    const result = await runLighthouse(url)
    if (!result?.lhr) {
      console.error('Lighthouse failed')
      process.exit(1)
    }

    const { lhr } = result

    console.log('\n═══ Lighthouse Scores ═══')
    for (const cat of Object.values(lhr.categories)) {
      const score = Math.round(((cat as { score: number }).score ?? 0) * 100)
      const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5))
      console.log(`  ${(cat as { title: string }).title.padEnd(20)} ${bar} ${score}`)
    }

    const failures: Array<{
      id: string
      title: string
      description: string
      category: string
      displayValue?: string
    }> = []

    for (const [catKey, cat] of Object.entries(lhr.categories)) {
      for (const ref of (cat as { auditRefs: Array<{ id: string }> }).auditRefs) {
        const audit = lhr.audits[ref.id]
        if (!audit || audit.score === null || audit.score >= 0.9) continue
        failures.push({
          id: ref.id,
          title: audit.title,
          description: audit.description?.slice(0, 160) ?? '',
          category: catKey,
          displayValue: audit.displayValue,
        })
      }
    }

    if (failures.length > 0) {
      console.log(`\n═══ Failures (${failures.length}) ═══`)
      for (const f of failures) {
        console.log(`  ✗ [${f.category}] ${f.title}${f.displayValue ? ' — ' + f.displayValue : ''}`)
        if (f.description) console.log(`    ${f.description}`)
      }
    } else {
      console.log('\n✓ All audits passed!')
    }
  } finally {
    server?.kill()
  }
}

main().catch((e) => {
  console.error(e)
  server?.kill()
  process.exit(1)
})
