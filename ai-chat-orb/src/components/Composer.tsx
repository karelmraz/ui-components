import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { PlusIcon, SendIcon, StopIcon } from './icons';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
}

/** Imperative surface exposed to the parent (used by the ⌘/ shortcut). */
export interface ComposerHandle {
  focus: () => void;
}

// Auto-grow clamp — roughly eight lines of text.
const MAX_HEIGHT_PX = 220;

/**
 * Bottom message composer. Auto-grows up to a max height, ⌘/Ctrl+Enter (or
 * plain Enter) submits, Shift+Enter inserts a newline. Replaces the send
 * button with a stop button while streaming.
 */
export const Composer = forwardRef<ComposerHandle, Props>(function Composer(
  { value, onChange, onSend, onStop, isStreaming },
  ref,
) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({ focus: () => taRef.current?.focus() }), []);

  // Auto-grow logic — set height to scrollHeight, clamp to the max.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, MAX_HEIGHT_PX) + 'px';
  }, [value]);

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="border-t border-cyan-400/10 bg-black/30 px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        <div className="relative flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-black/40 px-4 py-3 ring-1 ring-cyan-400/10 focus-within:border-cyan-400/40 focus-within:ring-cyan-400/20">
          <PlusButton />
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) onSend();
              }
            }}
            placeholder="Ask J.A.R.V.I.S anything…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-cyan-50 placeholder:text-cyan-200/50 focus:outline-none"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/30 transition hover:bg-rose-400/25"
            >
              <StopIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/40 transition hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SendIcon />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between px-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200/80">
          <span>
            <kbd className="rounded border border-cyan-400/15 bg-cyan-400/[0.04] px-1.5 py-0.5 font-mono text-[13px] leading-none">
              ↵
            </kbd>{' '}
            send ·{' '}
            <kbd className="rounded border border-cyan-400/15 bg-cyan-400/[0.04] px-1.5 py-0.5 font-mono text-[13px] leading-none">
              ⇧↵
            </kbd>{' '}
            newline
          </span>
          <span>responses are simulated locally</span>
        </div>
      </div>
    </div>
  );
});

function PlusButton() {
  return (
    <button
      type="button"
      aria-label="Attach"
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.04] text-cyan-200/80 transition hover:border-cyan-400/30 hover:text-cyan-100"
    >
      <PlusIcon size={14} />
    </button>
  );
}
