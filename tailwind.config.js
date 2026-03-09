/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Courier Prime"', 'monospace'],
        serif: ['"Times New Roman"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
