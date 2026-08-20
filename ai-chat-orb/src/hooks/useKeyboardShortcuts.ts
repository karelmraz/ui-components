import { useEffect, useRef } from 'react';

/**
 * Window-level keyboard shortcuts. The listener is registered once; the
 * shortcut table is read through a ref, so callers can pass fresh closures
 * on every render without re-subscribing. Shortcuts that require the modifier
 * call preventDefault() so the browser's own ⌘N / ⌘B bindings don't fire.
 */

export interface Shortcut {
  /** `KeyboardEvent.key` to match, e.g. 'n' or 'Escape'. */
  key: string;
  /** Require ⌘ (macOS) / Ctrl to be held. */
  mod?: boolean;
  run: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const match = shortcutsRef.current.find((s) => s.key === e.key && (!s.mod || mod));
      if (!match) return;
      if (match.mod) e.preventDefault();
      match.run();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
