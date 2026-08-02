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
        accent: {
          DEFAULT: 'var(--accent-color)',
          light: 'var(--accent-light)',
          glow: 'rgba(99, 102, 241, 0.15)',
        },
        semantic: {
          red: '#ef4444',
          'red-bg': 'rgba(239, 68, 68, 0.1)',
          yellow: '#f59e0b',
          'yellow-bg': 'rgba(245, 158, 11, 0.1)',
          green: '#22c55e',
          'green-bg': 'rgba(34, 197, 94, 0.1)',
          blue: '#3b82f6',
          'blue-bg': 'rgba(59, 130, 246, 0.1)',
          purple: '#a855f7',
          'purple-bg': 'rgba(168, 85, 247, 0.1)',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: {
          subtle: 'var(--border-subtle)',
          DEFAULT: 'var(--border-color)',
          hover: 'rgba(99, 102, 241, 0.3)',
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
