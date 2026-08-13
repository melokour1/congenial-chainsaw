// Deliberately dark-only, unlike apps/mobile's light/dark-themeable system —
// a driver app used curbside in daylight and at night both benefit from one
// high-contrast look, and it halves the design surface for v1. Same brand
// gold as the rest of the LAXValetCare family; green/blue/red are semantic
// (online, break, danger) the way a ride-share driver app uses them, not
// brand colors.
export const COLORS = {
  black: '#000000',
  surface: '#141414',
  surfaceAlt: '#1E1E1E',
  border: '#2A2A2A',
  white: '#FFFFFF',
  textMuted: '#9A9A9A',
  gold: '#E0A458',
  green: '#3DDC84',
  blue: '#5B9CFF',
  red: '#FF5B5B',
} as const;

// 'Inter'/'Plus Jakarta Sans' from @laxvaletcare/config are web font-family
// strings — no matching font is loaded natively, so body text intentionally
// omits fontFamily and falls back to the platform system font. Jost is
// loaded (see app/_layout.tsx) and used for display/heading text only.
export const FONTS = {
  display: 'Jost_700Bold',
} as const;

export const RADII = {
  card: 14,
  pill: 999,
} as const;

export const MIN_TOUCH_TARGET = 48;
