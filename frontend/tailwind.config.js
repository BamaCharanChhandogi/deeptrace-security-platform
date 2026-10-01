/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        deeptrace: {
          bg: '#0E1033',          // Authentic DeepTrace dark navy backdrop
          surface: '#18194B',     // Exact DeepTrace brand card/elementor navy
          surfaceHover: '#1F215E',
          surfaceLight: '#23266A',
          border: '#2C3078',      // Elegant subtle border
          accent: '#009CD9',      // Exact DeepTrace brand cyan/blue: rgb(0, 156, 217)
          accentHover: '#0084B8',
          textLight: '#FCFCFC',   // Exact DeepTrace hero text: rgb(252, 252, 252)
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
