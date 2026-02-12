/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f0',
          100: '#faecd6',
          200: '#f4d5aa',
          300: '#ecb86e',
          400: '#e49a3a',
          500: '#d97b1c',
          600: '#c05f14',
          700: '#9f4514',
          800: '#813817',
          900: '#6a2f16',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
      },
      fontFamily: {
        sans: ['"Sarabun"', 'sans-serif'],
        display: ['"Sarabun"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
