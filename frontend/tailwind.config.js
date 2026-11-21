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
        brand: {
          navy: '#102D59',
          blue: '#2563EB',
          sky: '#EAF3FF',
          bg: '#F5F8FE',
          surface: '#FFFFFF',
          text: '#14213D',
          muted: '#64748B',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#DC2626',
        },
        primary: {
          50: '#eaf3ff',
          100: '#d5e7ff',
          200: '#b4d4ff',
          300: '#82b9fe',
          400: '#4894fb',
          500: '#2563eb', // Primary blue #2563EB
          600: '#1751d0',
          700: '#133fa8',
          800: '#133587',
          900: '#102d59', // Deep navy #102D59
          950: '#0a1d3b',
        },
        navy: {
          light: '#1b3f6c',
          DEFAULT: '#102D59',
          dark: '#0a1d3b',
        },
        accent: {
          blue: '#2563eb',
          cyan: '#06b6d4',
          emerald: '#16a34a',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 20px -2px rgba(16, 45, 89, 0.08)',
        'brand-lg': '0 10px 30px -4px rgba(16, 45, 89, 0.12)',
        'brand-glow': '0 0 25px rgba(37, 99, 235, 0.25)',
      }
    },
  },
  plugins: [],
};
