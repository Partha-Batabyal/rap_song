/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          black: '#050508',
          card: 'rgba(15, 15, 25, 0.6)',
          purple: '#9d4edd',
          cyan: '#00f5d4',
          neonPurple: '#d8b4fe',
          neonCyan: '#a7f3d0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        studio: ['Outfit', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-purple': 'glowPurple 3s ease-in-out infinite',
        'glow-cyan': 'glowCyan 3s ease-in-out infinite',
        'soundwave-1': 'soundwave 1.2s ease-in-out infinite alternate',
        'soundwave-2': 'soundwave 0.8s ease-in-out infinite alternate 0.2s',
        'soundwave-3': 'soundwave 1.5s ease-in-out infinite alternate 0.4s',
        'soundwave-4': 'soundwave 1s ease-in-out infinite alternate 0.1s',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPurple: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)' },
        },
        glowCyan: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)' },
        },
        soundwave: {
          '0%': { height: '8px' },
          '100%': { height: '32px' }
        }
      }
    },
  },
  plugins: [],
}
