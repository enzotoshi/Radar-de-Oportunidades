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
          DEFAULT: 'var(--color-structure)',
          700: 'var(--color-structure)',
          800: 'var(--color-structure-subtle)',
        },
        accent: {
          DEFAULT: 'var(--color-action)',
          100: 'var(--color-action-soft)',
          600: 'var(--color-action-hover)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-soft)',
        },
        danger: 'var(--color-danger)',
        surface: {
          DEFAULT: 'var(--color-canvas)',
          card: 'var(--color-surface)',
          elevated: 'var(--color-surface-muted)',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans Variable', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
