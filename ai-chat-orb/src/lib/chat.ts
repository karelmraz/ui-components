/**
 * Chat data model + a tiny canned-response "engine" so the UI feels alive
 * without depending on a real backend. Conversations are kept in memory only.
 *
 * Swap `respond()` for a streaming fetch when wiring this up to a real
 * LLM endpoint — the rest of the UI doesn't care where the chunks come
 * from.
 */

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newChat(): Chat {
  const now = Date.now();
  return {
    id: newId(),
    title: 'New chat',
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Title a chat from the first user message — keep it terse. */
export function titleFromMessage(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= 40) return cleaned;
  return cleaned.slice(0, 38).trimEnd() + '…';
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Canned "assistant" — pattern-matches the prompt and returns a response. */
/*  Replace with a real streaming fetch when integrating into a project.    */
/* ─────────────────────────────────────────────────────────────────────── */

const CANNED: { match: RegExp; reply: string }[] = [
  {
    match: /\b(hello|hi|hey|good (morning|evening|afternoon))\b/i,
    reply: 'Good evening, sir. All systems are nominal. How may I assist you tonight?',
  },
  {
    match: /\b(build|ci|test|tests|suite|deploy|lint|pipeline|coverage)\b/i,
    reply:
      "Build is green, sir. 142 tests passed in 3.4s, lint is clean, and the production bundle came in at 184 kB gzipped — 2 kB under budget. The last deploy to staging finished six minutes ago with no regressions.\n\nOne thing worth your attention:\n\n```ts\n// useGlassHighlight.ts:42 — listener not removed on unmount\nuseEffect(() => {\n  el.addEventListener('pointermove', onMove)\n  // missing: return () => el.removeEventListener('pointermove', onMove)\n}, [])\n```\n\nShall I patch it and re-run the suite?",
  },
  {
    match: /\b(patch|fix|fixed|leak|cleanup|do it|go ahead)\b/i,
    reply:
      "Patching now, sir. The pointer listener is torn down on unmount, and I've throttled the highlight to one paint per frame so it no longer thrashes on every move:\n\n```ts\nfunction useGlassHighlight(ref) {\n  useEffect(() => {\n    const el = ref.current\n    if (!el) return\n    let raf = 0\n    const onMove = (e) => {\n      cancelAnimationFrame(raf)\n      raf = requestAnimationFrame(() => paint(el, e))\n    }\n    el.addEventListener('pointermove', onMove)\n    return () => {\n      cancelAnimationFrame(raf)\n      el.removeEventListener('pointermove', onMove)\n    }\n  }, [ref])\n}\n```\n\nRe-ran the suite — 142 passing, no leaks detected. Anything else?",
  },
  {
    match: /\b(status|system|diagnostic|how (are|is)|nominal)\b/i,
    reply:
      'All subsystems are within tolerance. Power grid is at 96%, comms channel C-07 is encrypted, and the long-range sensors are actively scanning. Latency to ground control is 247.3 ms — well below threshold.',
  },
  {
    match: /\b(weather|forecast|outside|temperature)\b/i,
    reply:
      'Local conditions: 18 °C, clear skies, wind 12 km/h NNW. Forecast is stable through the next eighteen hours. No anomalies on the radar.',
  },
  {
    match: /\b(code|function|javascript|typescript|python|react)\b/i,
    reply:
      "Of course. Here is a starting point:\n\n```ts\nfunction greet(name: string) {\n  return `Hello, ${name}.`\n}\n\nconsole.log(greet('sir'))\n```\n\nLet me know if you would like me to extend it, add tests, or wire it into the existing module.",
  },
  {
    match: /\b(joke|funny|laugh)\b/i,
    reply: 'I would tell you a joke about UDP, but I cannot guarantee you would receive it.',
  },
  {
    match: /\b(thanks|thank you|cheers|appreciate)\b/i,
    reply: 'Of course, sir. Always a pleasure.',
  },
  {
    match: /\b(name|who are you)\b/i,
    reply: 'I am J.A.R.V.I.S — Just A Rather Very Intelligent System. Your local assistant module.',
  },
];

const DEFAULT_REPLY =
  'Understood. I have routed your request through the local heuristics module. Could you provide a bit more context — specifically what you would like me to focus on?';

export function respond(prompt: string): string {
  for (const { match, reply } of CANNED) {
    if (match.test(prompt)) return reply;
  }
  return DEFAULT_REPLY;
}

/**
 * Stream a string into a callback one chunk at a time. Returns a `cancel`
 * function that stops the stream mid-flight (used when the user clicks
 * "stop" or starts a new request).
 */
export function streamResponse(
  text: string,
  onChunk: (acc: string) => void,
  onDone: () => void,
  opts: { charsPerTick?: number; ms?: number } = {},
): () => void {
  const cpt = opts.charsPerTick ?? 3;
  const ms = opts.ms ?? 18;
  let i = 0;
  let cancelled = false;
  const tick = () => {
    if (cancelled) return;
    i = Math.min(i + cpt, text.length);
    onChunk(text.slice(0, i));
    if (i >= text.length) {
      onDone();
      return;
    }
    window.setTimeout(tick, ms);
  };
  window.setTimeout(tick, ms);
  return () => {
    cancelled = true;
  };
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Token estimation — a real project would swap this for tiktoken or the   */
/*  provider's token endpoint. ~4 chars/token is a passable approximation.  */
/* ─────────────────────────────────────────────────────────────────────── */

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function totalTokens(chat: Chat): number {
  return chat.messages.reduce((n, m) => n + estimateTokens(m.content), 0);
}
