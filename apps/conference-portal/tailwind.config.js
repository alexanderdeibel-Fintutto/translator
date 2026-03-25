/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'ag-primary': 'var(--ag-primary)',
        'ag-accent': 'var(--ag-accent)',
      },
    },
  },
  plugins: [],
}
