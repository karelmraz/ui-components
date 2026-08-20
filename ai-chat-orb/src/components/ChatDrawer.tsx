import type { Chat } from '../lib/chat';
import { TrashIcon } from './icons';

/**
 * Slide-out conversation drawer. Sits flush against the left edge (above the
 * icon rail) when open and slides fully off-screen when closed.
 */
export function ChatDrawer({
  open,
  chats,
  activeId,
  onSelect,
  onDelete,
  onClose,
}: {
  open: boolean;
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`pointer-events-none fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-white/10 bg-[#06080d] p-4 shadow-2xl transition-transform duration-300 ease-out ${
          // Flush to the left edge; sits above the icon rail (z-40 > z-20) when
          // open, and slides fully off-screen (its own width) when closed.
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/50">
            Conversations
          </span>
          <span className="text-[10px] text-cyan-200/30">⌘B to close</span>
        </div>
        {chats.length === 0 ? (
          <p className="px-2 py-6 text-center text-[11px] text-cyan-200/40">No conversations yet</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {chats.map((c) => (
              <li key={c.id}>
                <div
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] transition ${
                    activeId === c.id
                      ? 'bg-cyan-400/[0.1] text-cyan-50 ring-1 ring-cyan-400/25'
                      : 'text-cyan-100/80 hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="flex-1 truncate text-left"
                  >
                    {c.title}
                  </button>
                  <button
                    type="button"
                    aria-label="Delete chat"
                    onClick={() => onDelete(c.id)}
                    className="hidden rounded p-1 text-cyan-200/40 hover:bg-rose-400/10 hover:text-rose-300 group-hover:block"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}
