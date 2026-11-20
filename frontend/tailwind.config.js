/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fa',
          100: '#e1ecf6',
          200: '#c3d9ed',
          300: '#94bbe1',
          400: '#5e9ad2',
          500: '#387ec4',
          600: '#2763a8',
          700: '#214f88',
          800: '#1b3f6c',
          900: '#0f2746',
          950: '#081629', // Navy Blue signature
        },
        navy: {
          light: '#1b3f6c',
          DEFAULT: '#0f2746',
          dark: '#081629',
        },
        accent: {
          blue: '#2563eb',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
    },
  },
  plugins: [],
};
