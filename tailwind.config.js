/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eva: {
          base: '#020617', // Deep Dark Blue-Black (Slate 950)
          panel: '#0F172A', // Slate 900
          border: '#1E293B', // Slate 800
          text: '#F8FAFC', // Slate 50
          glow: '#38BDF8', // Sky 400
          accent: '#818CF8', // Indigo 400
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 4s linear infinite',
        'blink': 'blink 4s infinite',
        'pop': 'pop 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        blink: {
          '0%, 96%, 98%': { opacity: '1' },
          '97%, 99%': { opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
