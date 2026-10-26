// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        payflex: {
          bg: '#F8F9FA',
          surface: '#FFFFFF',
          primary: '#00C853',
          'primary-light': '#E8F5E9',
          'primary-dark': '#009624',
          'text-primary': '#0F172A',
          'text-secondary': '#64748B',
          'text-muted': '#94A3B8',
          'icon-bg': '#F1F5F9',
          border: '#E2E8F0',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};