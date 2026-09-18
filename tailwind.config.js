/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        care: {
          safe: '#059669',
          warn: '#d97706',
          alert: '#dc2626',
          info: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        touch: '64px',
      },
    },
  },
  plugins: [],
};
