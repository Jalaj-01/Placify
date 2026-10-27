import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        card: 'var(--bg-card)',
        elevated: 'var(--bg-elevated)',
        hover: 'var(--bg-hover)',
        palette: {
          primary: '#2563EB',
          accent: '#FACC15',
          surface: '#FFFDF7',
          muted: '#EEF2FF',
          text: '#1E1B4B',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          light: 'var(--accent-light)',
          glow: 'rgba(37, 99, 235, 0.20)',
          primary: '#2563EB',
          yellow: '#FACC15',
          surface: '#FFFDF7',
          muted: '#EEF2FF',
          text: '#1E1B4B',
        },
        semantic: {
          red: '#ef4444',
          'red-bg': 'rgba(239, 68, 68, 0.1)',
          yellow: '#FACC15',
          'yellow-bg': 'rgba(250, 204, 21, 0.15)',
          green: '#10B981',
          'green-bg': 'rgba(16, 185, 129, 0.12)',
          blue: '#2563EB',
          'blue-bg': 'rgba(37, 99, 235, 0.12)',
          purple: '#6366F1',
          'purple-bg': 'rgba(99, 102, 241, 0.14)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-color)',
          hover: 'rgba(132, 80, 203, 0.35)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        micro: ['11px', { lineHeight: '1.4' }],
        secondary: ['13px', { lineHeight: '1.5' }],
        body: ['15px', { lineHeight: '1.6' }],
        'card-title': ['17px', { lineHeight: '1.4' }],
        section: ['20px', { lineHeight: '1.3' }],
        page: ['24px', { lineHeight: '1.2' }],
        stat: ['30px', { lineHeight: '1.1' }],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 0 0 1px var(--border-color)',
        'card-hover': '0 4px 24px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [forms],
}
