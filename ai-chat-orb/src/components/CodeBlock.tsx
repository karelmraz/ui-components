import { type ReactNode } from 'react';
import { CopyButton } from './CopyButton';

/** A fenced code block — header (language + copy) over syntax-highlighted code. */
export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative rounded-lg border border-cyan-400/15 bg-black/40">
      <div className="flex items-center justify-between border-b border-cyan-400/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cyan-200/50">
        <span>{lang ?? 'code'}</span>
        <CopyButton text={code} compact />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-cyan-100/95">
        <code>{highlightCode(code)}</code>
      </pre>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Lightweight TS/JS syntax highlighter                                    */
/*  A tiny tokenizer — enough to colour the canned code snippets without a  */
/*  syntax-highlighting dependency. Operators/punctuation and unknown or    */
/*  partially-streamed tokens fall through uncoloured, so it degrades       */
/*  gracefully while a code block is still streaming in.                    */
/* ─────────────────────────────────────────────────────────────────────── */

const KEYWORDS = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'of',
  'in',
  'new',
  'class',
  'extends',
  'implements',
  'interface',
  'type',
  'enum',
  'import',
  'from',
  'export',
  'default',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'throw',
  'typeof',
  'instanceof',
  'void',
  'delete',
  'yield',
  'switch',
  'case',
  'break',
  'continue',
  'do',
  'this',
  'super',
  'null',
  'undefined',
  'true',
  'false',
  'as',
  'is',
  'keyof',
  'readonly',
]);

const SYNTAX = {
  comment: '#5f7488',
  string: '#8ee6b0',
  number: '#f6ad55',
  keyword: '#c79bff',
  func: '#5fc7ff',
  type: '#4fd6cf',
};

// One pass: a comment, a string, a number, or an identifier. Everything else
// (operators, punctuation, whitespace) is emitted verbatim as plain text.
const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)/g;

function highlightCode(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code)) !== null) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const tok = m[0];
    let color: string | undefined;
    let italic = false;
    if (m[1]) {
      color = SYNTAX.comment;
      italic = true;
    } else if (m[2]) {
      color = SYNTAX.string;
    } else if (m[3]) {
      color = SYNTAX.number;
    } else if (KEYWORDS.has(tok)) {
      color = SYNTAX.keyword;
    } else if (/^\s*\(/.test(code.slice(m.index + tok.length))) {
      color = SYNTAX.func; // identifier immediately followed by "("
    } else if (/^[A-Z]/.test(tok)) {
      color = SYNTAX.type; // Capitalised identifier → treat as a type
    }
    out.push(
      color ? (
        <span key={key++} style={{ color, fontStyle: italic ? 'italic' : undefined }}>
          {tok}
        </span>
      ) : (
        tok
      ),
    );
    last = m.index + tok.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
