/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nav: { DEFAULT: '#131921', light: '#232f3e', hover: '#37475a' },
        brand: { DEFAULT: '#ff9900', soft: '#febd69', dark: '#e47911' },
        cta: { DEFAULT: '#ffd814', hover: '#f7ca00', border: '#fcd200' },
        buy: { DEFAULT: '#ffa41c', hover: '#fa8900', border: '#ff8f00' },
        link: { DEFAULT: '#007185', hover: '#c7511f' },
        price: '#b12704',
        star: '#ffa41c',
        page: '#e3e6e6',
        line: '#d5d9d9',
      },
      fontFamily: {
        sans: ['"Amazon Ember"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 5px 0 rgba(213, 217, 217, 0.5)',
        pop: '0 8px 24px rgba(15, 17, 17, 0.18)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
      },
    },
  },
  plugins: [],
};
