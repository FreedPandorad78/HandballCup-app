/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg:          '#0a0e1a',  // fondo de página
          card:        '#0f1524',  // tarjetas
          'card-alt':  '#131b2e',  // filas alternadas
          border:      '#1e2d45',  // bordes
          accent:      '#e63946',  // rojo principal
          'accent-dim':'#b82d38',  // rojo hover / pressed
          text:        '#edf0f7',  // texto primario
          muted:       '#6b7a9e',  // texto secundario
          faint:       '#243050',  // bg muy sutil
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      keyframes: {
        scoreFlash: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4', transform: 'scale(1.08)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
      },
      animation: {
        'score-flash': 'scoreFlash 0.4s ease-in-out',
        'live-pulse':  'livePulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
