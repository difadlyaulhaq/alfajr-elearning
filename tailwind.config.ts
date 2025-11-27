import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#000000',
          gold: '#C5A059',
          white: '#FFFFFF',
          gray: '#F8F9FA',
          success: '#28A745',
          warning: '#FFC107',
          danger: '#DC3545',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;