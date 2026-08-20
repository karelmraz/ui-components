import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The stylesheet is small (~13 kB) but is a render-blocking request on the
 * critical path. Inline it into index.html and drop the asset, so first paint
 * needs exactly one round trip.
 */
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      let out = html;
      for (const [file, asset] of Object.entries(ctx.bundle)) {
        if (!file.endsWith('.css') || asset.type !== 'asset') continue;
        const css = String(asset.source);
        const link = new RegExp(`<link[^>]+href="[^"]*${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`);
        if (!link.test(out)) continue;
        out = out.replace(link, `<style>${css}</style>`);
        delete ctx.bundle[file];
      }
      return out;
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
  // Ship source maps so production stack traces stay debuggable (and Lighthouse's
  // valid-source-maps audit passes).
  build: { sourcemap: true },
});
