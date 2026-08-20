/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Manrope Variable',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Inter Variable',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      colors: {
        page: 'var(--bg)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        strong: 'var(--strong)',
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface-hover)',
        },
        hairline: 'var(--border)',
        popover: 'var(--popover)',
        tooltip: 'var(--tooltip)',
        accent: 'var(--accent)',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(58% 48% at 80% 30%, var(--glow-1), transparent 62%), radial-gradient(46% 42% at 12% 8%, var(--glow-2), transparent 60%), radial-gradient(54% 50% at 88% 92%, var(--glow-3), transparent 66%)',
        'scrim-side': 'linear-gradient(100deg, var(--bg) 0%, var(--bg) 28%, transparent 56%)',
        'scrim-top': 'linear-gradient(to bottom, var(--bg) 0%, var(--bg) 60%, transparent 78%)',
        brand: 'linear-gradient(135deg, var(--grad-1), var(--grad-2), var(--grad-3))',
        headline: 'linear-gradient(100deg, var(--grad-1), var(--grad-2), var(--grad-3))',
        cta: 'linear-gradient(90deg, var(--btn-1), var(--btn-2))',
        'cta-hover': 'linear-gradient(90deg, var(--btn-2), var(--btn-1))',
      },
    },
  },
  plugins: [],
};
