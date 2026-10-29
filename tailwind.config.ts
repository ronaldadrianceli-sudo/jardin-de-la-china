// tailwind.config.ts
import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F6E30', // #60823B del logo oscurecido para contraste AA con texto blanco
          leaf: '#60823B',
          dark: '#2D3516',
          cream: '#FAF1D9',
          wood: '#DABC86',
          terracotta: '#D98C5E',
          brown: '#763F2B',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
}
export default config
