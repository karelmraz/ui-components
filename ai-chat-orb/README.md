# AI chat orb

A J.A.R.V.I.S.-style chat interface built around a full-screen WebGL orb. The orb is one hand-written fragment shader — no three.js — and it reacts to what the app is doing.

![AI chat orb demo](../docs/media/ai-chat-orb.gif)

[Live demo](https://karelmraz.github.io/ui-components/ai-chat-orb/)

## What it does

- The orb stacks its effects in a single GLSL pass: a pulsing core, a soft aura, dashed and binary data rings, radial tick graduations, gauge arcs, radar sweeps and generating-time pulse waves, with hue rotation in YIQ space.
- It has three states — `idle`, `listening` (you start typing) and `generating` (a reply is streaming) — and the shader uniforms ease between them.
- The chat panel streams canned responses token by token, renders a small markdown subset and syntax-highlights code blocks with a copy button. There's a slide-out conversation drawer, an icon rail and a token-count badge.
- Keyboard shortcuts: <kbd>⌘</kbd><kbd>N</kbd> new chat, <kbd>⌘</kbd><kbd>/</kbd> focus composer, <kbd>⌘</kbd><kbd>B</kbd> toggle drawer.

## How it's built

- React 18 + TypeScript (strict), Vite, Tailwind CSS v3. No animation library — the orb is WebGL, the rest is CSS.
- The orb is split into three files with hard boundaries: `JarvisCore/shaders.ts` (the GLSL), `JarvisCore/renderer.ts` (a framework-free `createJarvisRenderer()` that owns the context, resize, the rAF loop and a complete teardown including `WEBGL_lose_context`) and a small React wrapper whose only job is lifecycle. The loop reads UI state through a ref, so typing or streaming never restarts the context, and static uniforms are uploaded once rather than per frame.
- Chat state lives in `useChats`: functional updates throughout, the active chat is derived rather than synced, and the live stream is tracked as `{ chatId, cancel }` so start / stop / delete are all cancellation-safe. Keyboard shortcuts are a declarative table behind one window listener (`useKeyboardShortcuts`).
- `src/lib/chat.ts` is the data model plus the canned-response engine; swapping `respond()` for a streaming fetch is all it takes to wire a real backend.
- `src/lib/markdown.ts` is a deliberately tiny markdown renderer (paragraphs, inline code, fenced blocks) so the bundle stays small.
- Conversations are in-memory by design.

Lighthouse on the production build (desktop): performance / accessibility / best practices / SEO = **100 / 100 / 100 / 100**.

## Running

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production bundle in dist/ (CSS is inlined into index.html)
npm run audit     # Lighthouse against the production build (uses puppeteer)
```
