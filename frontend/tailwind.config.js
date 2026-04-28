/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-navy': '#1E293B',
        'primary-blue': '#2563EB',
        'success-emerald': '#10B981',
        'danger-crimson': '#DC2626',
        'bg-gray': '#F8FAFC',
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

