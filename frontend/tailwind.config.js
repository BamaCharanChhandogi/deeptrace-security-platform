/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deeptrace: {
          navy: '#18194B',        // Exact DeepTrace brand navy
          navyDark: '#10133B',    // Dark navy for sidebar
          navyHover: '#23266A',
          cyan: '#009CD9',        // Exact DeepTrace brand cyan: rgb(0, 156, 217)
          cyanHover: '#0084B8',
          cyanLight: '#E0F2FE',   // Soft pastel cyan for badges/icons
          canvas: '#F8FAFC',      // Crisp light SaaS canvas
          card: '#FFFFFF',        // Pure white card surfaces
          border: '#E2E8F0',      // Clean slate border
          muted: '#64748B'        // Slate-500 body text
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
