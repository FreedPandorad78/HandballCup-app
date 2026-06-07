/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hc: {
          50:  '#eef4ff',
          100: '#d9e7ff',
          200: '#bcd2ff',
          300: '#8fb3fe',
          400: '#5d8bfb',
          500: '#3563f5',
          600: '#1d47e8',
          700: '#1635cc',
          800: '#182ca6',
          900: '#0d1f40',  // header / brand primary
          950: '#060f20',  // dark mode page bg
        },
      },
      keyframes: {
        scoreFlash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4', transform: 'scale(1.1)' },
        },
      },
      animation: {
        'score-flash': 'scoreFlash 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
