/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7c5cff', dark: '#6947e3', wash: '#eee9ff' },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          soft: 'rgb(var(--color-ink-soft) / <alpha-value>)'
        },
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        teal: { DEFAULT: '#2dd4bf', dark: '#0d9488', wash: '#d7fbf6' },
        success: { DEFAULT: '#16a34a', wash: '#dcfce7' },
        brick: { DEFAULT: '#dc2626', wash: '#fee2e2' },
        steel: { DEFAULT: '#64748b', wash: '#e2e8f0' },
        line: {
          DEFAULT: 'rgb(var(--color-line) / <alpha-value>)',
          strong: 'rgb(var(--color-line-strong) / <alpha-value>)'
        },
        dim: 'rgb(var(--color-dim) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)'
      },
      fontFamily: {
        display: ['"Hanken Grotesk"', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'sans-serif'],
        ledger: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        DEFAULT: '8px'
      }
    }
  },
  plugins: []
}
