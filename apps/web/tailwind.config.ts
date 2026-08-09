import type { Config } from 'tailwindcss';
import { colors, radii, maxContentWidth } from '@laxvaletcare/config';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: colors.black,
        white: colors.white,
        'off-white': colors.offWhite,
        'dark-gray': colors.darkGray,
        'medium-gray': colors.mediumGray,
        'light-gray': colors.lightGray,
        gold: colors.gold,
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: `${radii.card}px`,
      },
      maxWidth: {
        content: `${maxContentWidth}px`,
      },
      boxShadow: {
        hero: '0 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
