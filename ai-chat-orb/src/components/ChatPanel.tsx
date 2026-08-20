import { useEffect, useRef, type ReactNode } from 'react';
import { type Chat, totalTokens } from '../lib/chat';
import { MessageBubble } from './MessageBubble';
import { Welcome } from './Welcome';

interface Props {
  chat: Chat | null;
  /** Id of the assistant message currently streaming in, if any. */
  streamingId: string | null;
  /** Fired when a starter prompt on the welcome screen is clicked. */
  onPrompt: (p: string) => void;
  /** Footer slot — the composer. */
  children: ReactNode;
}

/**
 * The chat column: header (title + token/status), the message thread (or the
 * welcome screen when empty), and a footer slot for the composer.
 */
export function ChatPanel({ chat, streamingId, onPrompt, children }: Props) {
  const isStreaming = streamingId !== null;
  const hasMessages = chat !== null && chat.messages.length > 0;

  return (
    <div className="relative flex w-[540px] shrink-0 flex-col border-l border-white/[0.07] bg-black/40 backdrop-blur-xl vert:w-full vert:min-h-0 vert:flex-1 vert:border-l-0 vert:border-t">
      {/* Top hairline highlight */}
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />

      <CardHeader chat={chat} isStreaming={isStreaming} />

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {hasMessages ? (
          <Thread chat={chat} streamingId={streamingId} />
        ) : (
          <Welcome onPrompt={onPrompt} />
        )}
      </div>

      {children}
    </div>
  );
}

function CardHeader({ chat, isStreaming }: { chat: Chat | null; isStreaming: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3">
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/60">J.A.R.V.I.S</span>
        <span className="truncate text-[13px] font-medium text-cyan-50">
          {chat?.title ?? 'New conversation'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <TokenBadge chat={chat} />
        <StatusDot streaming={isStreaming} />
      </div>
    </div>
  );
}

function TokenBadge({ chat }: { chat: Chat | null }) {
  const tokens = chat ? totalTokens(chat) : 0;
  return (
    <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] tabular-nums text-cyan-100/90">
      {tokens}t
    </span>
  );
}

function StatusDot({ streaming }: { streaming: boolean }) {
  return (
    <span
      className="relative flex size-2 rounded-full bg-cyan-300"
      title={streaming ? 'generating' : 'online'}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-cyan-300 opacity-60" />
    </span>
  );
}

function Thread({ chat, streamingId }: { chat: Chat; streamingId: string | null }) {
  const endRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view — also while it streams in.
  const lastContent = chat.messages[chat.messages.length - 1]?.content;
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.messages.length, lastContent]);

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="flex flex-col gap-6">
        {chat.messages.map((m) => (
          <MessageBubble key={m.id} message={m} streaming={streamingId === m.id} />
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
