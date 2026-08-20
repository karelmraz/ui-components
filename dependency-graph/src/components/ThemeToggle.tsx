import { Icon } from './Icons';

export interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="relative w-[42px] h-[22px] rounded-full border border-[var(--border-subtle)] cursor-pointer shrink-0 transition-colors"
      style={{ background: isDark ? 'rgba(125,211,252,0.12)' : 'rgba(0,0,0,0.06)' }}
      onClick={onToggle}
    >
      <div
        className="absolute top-[2px] w-[16px] h-[16px] rounded-full flex items-center justify-center shadow-sm transition-all duration-200"
        style={{
          left: isDark ? 22 : 3,
          background: isDark ? 'var(--accent)' : 'var(--text-secondary)',
        }}
      >
        <Icon name={isDark ? 'moon' : 'sun'} size={9} style={{ color: '#fff' }} />
      </div>
    </button>
  );
}
