// Maps @laxvaletcare/config design tokens into a light/dark theme pair.
// This is the single shared source apps/mobile's UI kit reads from — mirrors
// the intent of apps/web's tailwind.config.ts but for React Native StyleSheets.
import { colors, fonts, typeScale, radii, minTouchTarget } from '@laxvaletcare/config';

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    textMuted: string;
    inverseText: string;
    inverseBackground: string;
    accent: string;
    danger: string;
    success: string;
    overlay: string;
  };
  fonts: typeof fonts;
  typeScale: typeof typeScale;
  radii: typeof radii;
  minTouchTarget: number;
  spacing: (multiplier: number) => number;
}

const spacing = (n: number) => n * 4;

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    background: colors.white,
    surface: colors.offWhite,
    surfaceAlt: colors.lightGray,
    border: colors.lightGray,
    text: colors.black,
    textMuted: colors.mediumGray,
    inverseText: colors.white,
    inverseBackground: colors.black,
    accent: colors.gold,
    danger: '#B3261E',
    success: '#1E7A34',
    overlay: 'rgba(0,0,0,0.5)',
  },
  fonts,
  typeScale,
  radii,
  minTouchTarget,
  spacing,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    background: colors.black,
    surface: colors.darkGray,
    surfaceAlt: '#242424',
    border: '#2E2E2E',
    text: colors.white,
    textMuted: '#A3A3A3',
    inverseText: colors.black,
    inverseBackground: colors.white,
    accent: colors.gold,
    danger: '#FF6B60',
    success: '#4CD964',
    overlay: 'rgba(0,0,0,0.7)',
  },
  fonts,
  typeScale,
  radii,
  minTouchTarget,
  spacing,
};

export const themes: Record<ThemeMode, AppTheme> = { light: lightTheme, dark: darkTheme };
