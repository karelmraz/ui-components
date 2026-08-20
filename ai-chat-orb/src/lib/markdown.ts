/**
 * Minimal markdown helper — splits assistant text into prose and fenced code
 * blocks. Handles an *unterminated* opening fence (a code block still streaming
 * in) by treating everything after it as a code block, so the text types inside
 * the code card the whole time instead of snapping into one once the closing
 * ``` arrives.
 */

export type Part =
  { type: 'text'; content: string } | { type: 'code'; content: string; lang?: string };

export function splitCodeBlocks(text: string): Part[] {
  const out: Part[] = [];
  const re = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push({ type: 'text', content: text.slice(lastIndex, m.index).trim() });
    }
    out.push({
      type: 'code',
      content: m[2].trim(),
      lang: m[1] || undefined,
    });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    const rest = text.slice(lastIndex);
    // An opening fence with no matching closer — i.e. a code block that's still
    // streaming in. Render everything after the fence as a live code block.
    const open = rest.match(/```([a-zA-Z0-9_+-]*)\n?/);
    if (open) {
      const before = rest.slice(0, open.index).trim();
      if (before) out.push({ type: 'text', content: before });
      const code = rest.slice(open.index! + open[0].length);
      out.push({ type: 'code', content: code, lang: open[1] || undefined });
    } else {
      const trimmed = rest.trim();
      if (trimmed) out.push({ type: 'text', content: trimmed });
    }
  }
  return out.length ? out : [{ type: 'text', content: text }];
}
