import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Inline the (small) built CSS into <head> as a <style> tag and drop the
 * render-blocking <link rel="stylesheet">. Removes a render-blocking request
 * and a critical-request-chain hop, so first paint isn't gated on the CSS
 * round-trip. Build-only; dev keeps Vite's normal CSS handling.
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
        const src = asset.source;
        const css = typeof src === 'string' ? src : Buffer.from(src).toString('utf8');
        const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out
          .replace(new RegExp(`<link[^>]*href="[^"]*${escaped}"[^>]*>`), '')
          .replace('</head>', `<style>${css}</style></head>`);
        delete ctx.bundle[file]; // drop the now-unreferenced .css asset
      }
      return out;
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineCss()],
});
