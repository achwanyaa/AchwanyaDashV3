/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#111111',
        secondary: '#E8E3D9',
        accent: '#D97706',
        background: '#F8F7F5',
        border: '#E5E3DF',
        text: {
          primary: '#1A1A1A',
          secondary: '#6B7280',
        }
      },
    },
  },
  plugins: [],
}
