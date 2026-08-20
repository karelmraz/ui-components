import { useState } from 'react';
import { Icon } from './Icons';

// Chosen for variety: utility-heavy, mixed-category, testing-flavoured, tooling-heavy
const QUICK_PICKS = ['express', 'next', 'vitest', 'webpack'];

export interface PackageSearchProps {
  /** Seeds the input once; the draft is intentionally local state after that */
  defaultValue: string;
  busy: boolean;
  onSubmit: (name: string) => void;
}

export function PackageSearch({ defaultValue, busy, onSubmit }: PackageSearchProps) {
  const [value, setValue] = useState(defaultValue);

  const submit = (name: string) => {
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="mb-3">
      <form
        role="search"
        className="flex gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="npm package name"
          placeholder="npm package, e.g. express"
          spellCheck={false}
          autoComplete="off"
          className="flex-1 min-w-0 text-[12px] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--canvas-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--page-bg)] cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          <Icon name="package" size={11} />
          {busy ? 'Fetching' : 'Graph it'}
        </button>
      </form>

      <div className="flex items-center gap-1 mt-1.5">
        <span className="text-[10px] text-[var(--text-muted)]">Try:</span>
        {QUICK_PICKS.map((name) => (
          <button
            key={name}
            type="button"
            disabled={busy && name === value}
            onClick={() => {
              setValue(name);
              submit(name);
            }}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer bg-[var(--badge-bg)] text-[var(--badge-text)] hover:opacity-80 transition-opacity"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
