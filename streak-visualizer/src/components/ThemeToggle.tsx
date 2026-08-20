import { motion } from 'framer-motion';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

const moonGlyph = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const sunGlyph = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      className="relative w-[52px] h-[28px] rounded-full border border-[var(--divider)] cursor-pointer shrink-0"
      style={{ background: 'color-mix(in srgb, var(--streak-accent) 12%, var(--page-bg))' }}
      onClick={onToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-[3px] size-5 rounded-full flex items-center justify-center shadow-sm"
        animate={{
          left: isDark ? 28 : 3,
          background: isDark ? 'var(--streak-accent)' : 'var(--text-secondary)',
          rotate: isDark ? 360 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      >
        {isDark ? moonGlyph : sunGlyph}
      </motion.div>
    </motion.button>
  );
}
