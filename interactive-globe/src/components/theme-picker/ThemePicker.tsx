import { useCallback, useRef, useState } from 'react';
import { ThemeOption } from './ThemeOption';
import { ThemeSwatch } from './ThemeSwatch';
import { useDismiss } from '../../hooks/useDismiss';
import type { Theme } from '../../theme';

type ThemePickerProps = {
  themes: Theme[];
  theme: Theme;
  onChange: (id: string) => void;
};

export function ThemePicker({ themes, theme, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Color scheme: ${theme.name}`}
        className="pill flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-[15px]"
      >
        <ThemeSwatch grad={theme.grad} />
        <span className="hidden font-medium sm:inline">{theme.name}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-strong transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 max-h-[70vh] w-52 overflow-auto rounded-xl border border-hairline bg-popover p-1.5 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Color scheme
          </div>
          {themes.map((option) => (
            <ThemeOption
              key={option.id}
              theme={option}
              active={option.id === theme.id}
              onSelect={() => {
                onChange(option.id);
                close();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
