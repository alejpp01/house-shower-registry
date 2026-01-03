/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d8a8a',
        'primary-dark': '#1f6666',
      }
    },
  },
  plugins: [],
}
