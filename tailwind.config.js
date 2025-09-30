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
        lundies: {
          ivory: '#f5f1eb',
          linen: '#ebe3d7',
          stone: '#d6cec3',
          sand: '#c2b19b',
          peat: '#8b6f5a',
          heather: '#8fa089',
          moss: '#6f7a63',
          charcoal: '#1f1b16',
        },
        peat: {
          50: '#f7f3ef',
          100: '#ece3d7',
          200: '#ded1bd',
          300: '#cdb597',
          400: '#b3906c',
          500: '#9c7351',
          600: '#805942',
          700: '#664435',
          800: '#4d3228',
          900: '#3b2720',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-heading)', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}