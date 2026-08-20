/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        // "Vertical" frames — stack the orb above the chat. Triggers for
        // portrait/square (social posts) AND for any window narrower than the
        // two-column layout needs (68px rail + 520px orb + 540px chat ≈ 1128px);
        // below that the columns cramp and clip, so we stack instead. Wider
        // monitors keep the two-column layout.
        vert: { raw: '(max-aspect-ratio: 1 / 1), (max-width: 1150px)' },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
