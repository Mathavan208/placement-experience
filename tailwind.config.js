/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'galaxy-gradient': 'linear-gradient(to top right, #000000, #1a0033, #3f0071)',
      },
    },
  },
  plugins: [],
};
