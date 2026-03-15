/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        veroYellow: '#FBBF24', // The perfectly roasted Gari yellow
        veroOrange: '#F97316', // The hunger-stimulating orange
        veroBrown: '#78350F',  // The earthy, agricultural brown
      }
    },
  },
  plugins: [],
}