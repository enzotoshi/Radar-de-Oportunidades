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
        primary: {
          DEFAULT: '#1e3a5f',
          50: '#e8eef5',
          100: '#c5d5e8',
          200: '#9eb9d8',
          300: '#779dc8',
          400: '#5a88bc',
          500: '#3d73b0',
          600: '#2d5f9a',
          700: '#1e3a5f',
          800: '#162c4a',
          900: '#0d1e35',
        },
        accent: {
          DEFAULT: '#00d4aa',
          50: '#e0faf5',
          100: '#b3f3e6',
          200: '#80ebd5',
          300: '#4de2c4',
          400: '#26dcb7',
          500: '#00d4aa',
          600: '#00b892',
          700: '#009a7a',
          800: '#007c62',
          900: '#005e4a',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706',
        },
        danger: '#ef4444',
        surface: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          elevated: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #00d4aa22 100%)',
      },
      animation: {
        pulse_slow: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        confetti: 'confetti 1s ease-out forwards',
      },
      keyframes: {
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
