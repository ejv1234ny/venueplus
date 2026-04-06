/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2f7',
          100: '#cce5ef',
          200: '#99cbe0',
          300: '#66b1d0',
          400: '#3397c1',
          500: '#007db1', // Deep teal - main primary
          600: '#00648e',
          700: '#004b6a',
          800: '#003247',
          900: '#001923',
        },
        accent: {
          50: '#fff0ed',
          100: '#ffe1da',
          200: '#ffc3b5',
          300: '#ffa590',
          400: '#ff876b',
          500: '#ff6946', // Warm coral - main accent
          600: '#cc5438',
          700: '#993f2a',
          800: '#662a1c',
          900: '#33150e',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
