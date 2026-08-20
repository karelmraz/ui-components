import { memo } from 'react';
import type { Message } from '../lib/chat';
import { splitCodeBlocks } from '../lib/markdown';
import { CodeBlock } from './CodeBlock';
import { CopyButton } from './CopyButton';

interface Props {
  message: Message;
  streaming?: boolean;
}

/**
 * Renders one message. Assistant content is split on triple-backtick blocks so
 * code is highlighted + has its own copy affordance; everything else is normal
 * prose with paragraph breaks.
 *
 * Memoised: while a reply streams in, only the message being written changes
 * identity, so earlier bubbles skip re-rendering (and re-tokenising their
 * code blocks) on every chunk.
 */
export const MessageBubble = memo(function MessageBubble({ message, streaming }: Props) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex w-full gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar role={message.role} streaming={streaming} />
      <div className={`group relative max-w-[78%] ${isUser ? 'text-right' : ''}`}>
        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-200/40">
          <span>{isUser ? 'You' : 'J.A.R.V.I.S'}</span>
          <span>·</span>
          <time>{formatTime(message.createdAt)}</time>
        </div>
        <div
          className={`relative rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
            isUser
              ? 'bg-cyan-400/[0.12] text-cyan-50 ring-1 ring-cyan-400/25'
              : 'bg-white/[0.04] text-cyan-50 ring-1 ring-white/10'
          }`}
        >
          <Content text={message.content} />
          {streaming && (
            <span className="caret-blink ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-cyan-200" />
          )}
        </div>
        {!isUser && message.content.length > 0 && (
          <div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </div>
  );
});

function Content({ text }: { text: string }) {
  // Split on fenced code blocks. Render plain prose with paragraph breaks
  // and code blocks as highlighted cards.
  const parts = splitCodeBlocks(text);
  return (
    <div className="flex flex-col gap-3">
      {parts.map((p, i) =>
        p.type === 'code' ? (
          <CodeBlock key={i} code={p.content} lang={p.lang} />
        ) : (
          <Prose key={i} text={p.content} />
        ),
      )}
    </div>
  );
}

function Prose({ text }: { text: string }) {
  // Honour blank-line paragraph breaks; keep single newlines as soft wraps.
  const paragraphs = text.split(/\n{2,}/);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {p}
        </p>
      ))}
    </>
  );
}

function Avatar({ role, streaming }: { role: Message['role']; streaming?: boolean }) {
  if (role === 'user') {
    return (
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-cyan-300/15 text-[10px] font-medium uppercase tracking-widest text-cyan-200/90 ring-1 ring-cyan-300/30">
        you
      </div>
    );
  }
  return (
    <div
      className={`relative grid size-9 shrink-0 place-items-center rounded-full bg-cyan-400/15 ring-1 ring-cyan-400/30 ${
        streaming ? 'animate-pulse' : ''
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle
          cx="8"
          cy="8"
          r="6"
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-cyan-300/80"
        />
        <circle cx="8" cy="8" r="2.2" fill="currentColor" className="text-cyan-100" />
      </svg>
    </div>
  );
}

function formatTime(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
