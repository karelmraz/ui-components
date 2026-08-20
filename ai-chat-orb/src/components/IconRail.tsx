import type { Chat } from '../lib/chat';
import { DrawerIcon, PlusIcon } from './icons';

// Quick-switch buttons shown on the rail; older chats live in the drawer.
const MAX_RAIL_CHATS = 12;

/**
 * Slim left icon rail — drawer toggle, new chat, and quick-switch initials for
 * the most recent conversations. Hidden in the vertical (stacked) layout.
 */
export function IconRail({
  chats,
  activeId,
  onSelect,
  onNew,
  onToggleDrawer,
}: {
  chats: Chat[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onToggleDrawer: () => void;
}) {
  return (
    <nav className="absolute inset-y-0 left-0 z-20 flex w-[68px] flex-col items-center gap-2 border-r border-white/[0.04] bg-black/30 py-5 backdrop-blur-md vert:hidden">
      <button
        type="button"
        onClick={onToggleDrawer}
        aria-label="Toggle conversation drawer"
        className="grid size-10 place-items-center rounded-xl text-cyan-200/70 transition hover:bg-white/[0.06] hover:text-cyan-100"
      >
        <DrawerIcon />
      </button>

      <button
        type="button"
        onClick={onNew}
        aria-label="New chat"
        className="grid size-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-400/30 transition hover:bg-cyan-400/20"
      >
        <PlusIcon />
      </button>

      <div className="my-2 h-px w-6 bg-white/[0.06]" />

      <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto px-2 py-1.5">
        {chats.slice(0, MAX_RAIL_CHATS).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-label={c.title}
            title={c.title}
            className={`grid size-10 shrink-0 place-items-center rounded-xl text-[10px] font-medium uppercase tracking-wider transition ${
              activeId === c.id
                ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-400/40'
                : 'bg-white/[0.04] text-cyan-200/70 hover:bg-white/[0.08] hover:text-cyan-100'
            }`}
          >
            {initials(c.title)}
          </button>
        ))}
      </div>
    </nav>
  );
}

function initials(s: string): string {
  const cleaned = s.trim();
  if (!cleaned) return '··';
  const words = cleaned.split(/\s+/);
  if (words.length === 1) return cleaned.slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
