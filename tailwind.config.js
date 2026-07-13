/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7c5cff', dark: '#6947e3', wash: '#eee9ff' },
        ink: { DEFAULT: '#0f172a', soft: '#334155' },
        paper: '#f8fafc',
        surface: '#ffffff',
        teal: { DEFAULT: '#2dd4bf', dark: '#0d9488', wash: '#d7fbf6' },
        success: { DEFAULT: '#16a34a', wash: '#dcfce7' },
        brick: { DEFAULT: '#dc2626', wash: '#fee2e2' },
        steel: { DEFAULT: '#64748b', wash: '#e2e8f0' },
        line: { DEFAULT: '#e2e8f0', strong: '#cbd5e1' },
        dim: '#475569',
        muted: '#94a3b8'
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
