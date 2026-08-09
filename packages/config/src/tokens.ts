// Design system tokens — "If Uber designed an airport valet service with
// Turo's layout." Black & white brand; photography is the only color.
// Shared source for apps/web's tailwind.config.ts and apps/mobile's theme.

export const colors = {
  black: '#000000',
  white: '#FFFFFF',
  offWhite: '#F6F6F6',
  darkGray: '#1A1A1A',
  mediumGray: '#6B6B6B',
  lightGray: '#E5E5E5',
  gold: '#C8A97E', // premium CTAs / highlights only — use sparingly
} as const;

export const fonts = {
  display: '"Plus Jakarta Sans", sans-serif', // hero / section headers, bold 700
  body: '"Inter", sans-serif', // everything else
} as const;

export const typeScale = {
  hero: { fontFamily: fonts.display, fontWeight: 700, fontSize: 48 },
  sectionHeader: { fontFamily: fonts.display, fontWeight: 700, fontSize: 32 },
  cardTitle: { fontFamily: fonts.body, fontWeight: 600, fontSize: 18 },
  body: { fontFamily: fonts.body, fontWeight: 400, fontSize: 16 },
  caption: { fontFamily: fonts.body, fontWeight: 500, fontSize: 14 },
  button: { fontFamily: fonts.body, fontWeight: 500, fontSize: 16 },
} as const;

export const radii = {
  card: 12,
} as const;

export const shadows = {
  none: 'none',
  hero: '0 2px 8px rgba(0,0,0,0.1)',
} as const;

export const minTouchTarget = 48;
export const maxContentWidth = 1200;
