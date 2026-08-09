const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

/** e.g. "LYCM-150524" — 4 letters, dash, DDMMYY */
export function generateBookingCode(date = new Date()): string {
  let letters = '';
  for (let i = 0; i < 4; i++) letters += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${letters}-${dd}${mm}${yy}`;
}
