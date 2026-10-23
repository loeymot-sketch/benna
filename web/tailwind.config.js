/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e3a8a', dark: '#172554' },
        accent: { DEFAULT: '#dc2626', soft: '#fee2e2' },
        bg: '#f7f7f5',
        panel: '#ffffff',
        border: '#e6e4df',
        'border-strong': '#d6d3cc',
        ink: '#0f172a',
        muted: '#64748b',
        'muted-soft': '#94a3b8',
        urg: {
          normal: '#16a34a',
          priority: '#f59e0b',
          urgent: '#dc2626',
          express: '#0f172a',
        },
        st: {
          recue: '#94a3b8',
          encours: '#3b82f6',
          validation: '#a855f7',
          production: '#f97316',
          prete: '#16a34a',
          livree: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace'],
        hand: ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
};
