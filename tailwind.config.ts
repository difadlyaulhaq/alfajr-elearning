import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
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
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        DEFAULT: {
          css: {
            h1: {
              fontSize: '3rem', // Even larger
              fontWeight: '900', // Black font weight
              color: theme('colors.blue.800'), // Use a distinct color for H1
            },
            h2: {
              fontSize: '2.5rem', // Larger
              fontWeight: '800', // Extra bold
              color: theme('colors.blue.700'), // Use a distinct color for H2
            },
            h3: {
              fontSize: '2rem', // Larger
              fontWeight: '700', // Bold
              color: theme('colors.blue.600'), // Use a distinct color for H3
            },
            strong: {
              fontWeight: '700', // Bold
              color: theme('colors.brand.black'), // Keep black for strong
            },
            // Ensure lists are styled
            ul: {
              listStyleType: 'disc',
              paddingLeft: '1.5em',
            },
            ol: {
              listStyleType: 'decimal',
              paddingLeft: '1.5em',
            },
            li: {
              marginBottom: '0.5em',
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
};

export default config;