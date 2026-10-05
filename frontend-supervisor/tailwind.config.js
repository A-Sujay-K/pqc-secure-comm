/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#0f0f1a',
          700: '#12121f',
          600: '#1a1a2e',
        },
        pqc: {
          DEFAULT: '#0ea5e9',
          glow: '#00d4ff',
        },
        qkd: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
        },
        queue: {
          DEFAULT: '#7c3aed',
          glow: '#a855f7',
        },
        health: {
          good: '#10b981',
          warning: '#f97316',
          critical: '#ef4444',
          goodGlow: '#00ff88',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
