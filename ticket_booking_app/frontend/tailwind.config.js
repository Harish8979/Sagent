/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
      },
      colors: {
        ember: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          700: '#c2410c',
        },
        ocean: {
          100: '#e0f2fe',
          400: '#38bdf8',
          700: '#0369a1',
          950: '#082f49',
        },
        slate: {
          950: '#020617',
        },
      },
      boxShadow: {
        glow: '0 18px 60px rgba(14, 116, 144, 0.24)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at top, rgba(34, 197, 94, 0.16), transparent 32%), radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.18), transparent 28%), linear-gradient(135deg, rgba(8, 47, 73, 0.96), rgba(15, 23, 42, 0.98))',
      },
    },
  },
  plugins: [],
};
