import { ThemeSwatch } from './ThemeSwatch';
import type { Theme } from '../../theme';

type ThemeOptionProps = {
  theme: Theme;
  active: boolean;
  onSelect: () => void;
};

export function ThemeOption({ theme, active, onSelect }: ThemeOptionProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
        active ? 'bg-surface-hover text-ink' : 'text-muted hover:bg-surface'
      }`}
    >
      <ThemeSwatch grad={theme.grad} />
      <span className="flex-1">{theme.name}</span>
      {active && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
      )}
    </button>
  );
}
