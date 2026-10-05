/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F4F1EA',
          50: '#FAF8F4',
          100: '#F4F1EA',
          200: '#ECE7DE',
          300: '#D8D2C4',
          400: '#B8B09F',
        },
        ink: {
          DEFAULT: '#171717',
          pure: '#0F0F0F',
          secondary: '#66645F',
          muted: '#8E8B83',
          faint: '#B5B1A8',
        },
        signal: {
          DEFAULT: '#FF4D2E',
          hover: '#E53E20',
          dark: '#CC3214',
          dim: 'rgba(255, 77, 46, 0.12)',
          subtle: 'rgba(255, 77, 46, 0.06)',
        },
        line: {
          DEFAULT: '#D8D2C4',
          dark: '#C2BBB0',
          subtle: 'rgba(23, 23, 23, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        editorial: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        editorial: '0.12em',
        ultra: '0.2em',
      },
      borderWidth: {
        '1': '1px',
      }
    },
  },
  plugins: [],
}
