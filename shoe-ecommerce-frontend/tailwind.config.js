/** @type {import('tailwindcss').Config} */
export default {
   content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#f43f5e'
      }
    },
  },
  plugins: [],
}

