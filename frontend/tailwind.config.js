/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Class dark: theo nut doi giao dien cua web (html[data-theme="dark"]), khong theo he dieu hanh
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', "'Times New Roman'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};
