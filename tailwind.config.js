/** @type {import('tailwindcss').Config} */
export default {
  content: { relative: true, files: ['./index.html', './src/**/*.{ts,tsx}'] },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--paper) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        navy: 'rgb(var(--navy) / <alpha-value>)',
        wine: 'rgb(var(--wine) / <alpha-value>)',
        // salmon accent: 400 is the chosen colour #F0A68B; deeper shades are used for readable text
        peach: { 50: '#fef5f1', 100: '#fde8e0', 200: '#fad3c4', 300: '#f6bca6', 400: '#f0a68b', 500: '#e58a6b', 600: '#d06f50', 700: '#b0573b', 800: '#8c4530', 900: '#6e3828' },
      },
      fontFamily: {
        serif: ['"Inter"', 'system-ui', 'sans-serif'], // headings use the same sans family
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        paper: ['Georgia', '"Times New Roman"', 'serif'], // journal-style title page in the paper preview
      },
      maxWidth: { page: '1200px' },
      keyframes: { marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } } },
    },
  },
  plugins: [],
};
