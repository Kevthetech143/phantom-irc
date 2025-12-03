/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'phantom-dark': '#1a1a2e',
        'phantom-darker': '#0f0f1e',
        'phantom-purple': '#7c3aed',
        'phantom-purple-light': '#a78bfa',
        'phantom-gray': '#2d2d44',
      }
    },
  },
  plugins: [],
}
