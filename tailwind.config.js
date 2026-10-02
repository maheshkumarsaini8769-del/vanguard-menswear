/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        atelier: {
          50: '#fbfaf8',
          100: '#f5f4ef',
          200: '#ebe9e2',
          300: '#dcd9cf',
          400: '#b8b4a7',
          500: '#8f8a7c',
          600: '#696458',
          700: '#4a463c',
          800: '#2d2b24',
          900: '#1c1b17',
          950: '#11110f'
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        gold: {
          400: '#caa372',
          500: '#b08b58',
          600: '#947243'
        },
        bronze: {
          400: '#af8c64',
          500: '#926f47',
          600: '#755431'
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', 'serif'],
        display: ['"Italiana"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace']
      },
      letterSpacing: {
        'widest-luxury': '0.25em',
        'ultra-wide': '0.35em'
      }
    },
  },
  plugins: [],
}
