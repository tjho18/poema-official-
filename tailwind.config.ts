import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          bg:     '#ffffff',   // pure white — blank page (desktop)
          paper:  '#F5F0E8',   // warm paper — Kindle-like, mobile only
          text:   '#0a0a0a',   // near-black — fountain pen ink
          accent: '#0a0a0a',   // no separate accent; everything is black
          muted:  '#6b6b6b',   // medium gray for secondary text
        },
      },
      fontFamily: {
        // EB Garamond is used for everything — one typeface, many weights
        display: ['var(--font-garamond)', 'Georgia', 'serif'],
        body:    ['var(--font-garamond)', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.7s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
