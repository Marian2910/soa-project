/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#3F51B5',   // Primary Brand Color
          magenta: '#C13C9E',  // Secondary/Gradient End
          dark: '#1C1C1C',     // Primary Text
          gray: '#F7F7F5',     // Background
          surface: '#FFFFFF',  // Cards
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}