import { useEffect, useRef, useState } from 'react';
import { CopyIcon, CheckIcon } from './icons';

// How long the "Copied" confirmation stays visible.
const COPIED_MS = 1500;

/** Copy-to-clipboard button with a transient "Copied" confirmation. */
export function CopyButton({ text, compact }: { text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  // Drop any pending reset when the button unmounts mid-confirmation.
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      /* clipboard denied — fail silent */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1 rounded ${
        compact
          ? 'px-1.5 py-0.5 text-[10px]'
          : 'border border-cyan-400/15 bg-cyan-400/[0.04] px-2 py-1 text-[10px]'
      } uppercase tracking-[0.2em] text-cyan-200/60 transition hover:bg-cyan-400/[0.08] hover:text-cyan-100`}
    >
      {copied ? (
        <>
          <CheckIcon /> Copied
        </>
      ) : (
        <>
          <CopyIcon /> Copy
        </>
      )}
    </button>
  );
}
