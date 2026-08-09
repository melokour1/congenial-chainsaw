// Static mirror of the `terminals` / `airlines` tables (packages/database/migrations/0003_seed.sql).
// Used for instant dropdown rendering in both apps without a network round trip;
// the DB copy remains the source of truth for anything server-validated.

export interface TerminalDef {
  code: string;
  name: string;
  isClosed?: boolean;
  closedNote?: string;
  note?: string;
  airlines: string[];
}

export const TERMINALS: TerminalDef[] = [
  {
    code: '1',
    name: 'Terminal 1',
    note: '⚠️ Non-Southwest/JetBlue carriers may bus to West Gates',
    airlines: ['Southwest', 'JetBlue', 'Allegiant', 'Breeze', 'Cayman Airways', 'Frontier', 'Sun Country', 'Viva Aerobus'],
  },
  {
    code: '2',
    name: 'Terminal 2',
    airlines: ['Spirit', 'LATAM', 'WestJet', 'Norse Atlantic', 'Virgin Atlantic'],
  },
  {
    code: '3',
    name: 'Terminal 3 — Delta Hub',
    note: 'ℹ️ Delta One check-in at lower arrivals level, pillars 3F/3G',
    airlines: ['Delta', 'Aeromexico'],
  },
  {
    code: '4',
    name: 'Terminal 4',
    airlines: ['American Airlines', 'British Airways', 'Japan Airlines'],
  },
  {
    code: '5',
    name: 'Terminal 5',
    isClosed: true,
    closedNote: 'CLOSED until 2028',
    airlines: [],
  },
  {
    code: '6',
    name: 'Terminal 6',
    airlines: ['Alaska', 'Air Canada', 'Hawaiian', 'Horizon Air', 'Porter', 'Southern Airways Express'],
  },
  {
    code: '7',
    name: 'Terminal 7',
    airlines: ['United Airlines', 'United Express'],
  },
  {
    code: '8',
    name: 'Terminal 8',
    airlines: ['United Airlines', 'United Express'],
  },
  {
    code: 'B',
    name: 'Terminal B (TBIT)',
    note: '40+ international carriers',
    airlines: [
      'Air France', 'Emirates', 'Lufthansa', 'Qantas', 'Singapore Airlines', 'Cathay Pacific',
      'ANA', 'Korean Air', 'Qatar Airways', 'Turkish Airlines',
    ],
  },
];

export interface OffSiteOrigin {
  type: 'JSX' | 'ATLANTIC_AVIATION';
  name: string;
  description: string;
  address: string;
}

export const OFF_SITE_ORIGINS: OffSiteOrigin[] = [
  {
    type: 'JSX',
    name: 'JSX LAX',
    description: 'Private terminal near LAX',
    address: '901 W Imperial Hwy, Los Angeles, CA 90045',
  },
  {
    type: 'ATLANTIC_AVIATION',
    name: 'Atlantic Aviation LAX',
    description: 'Private FBO near LAX',
    address: '7300 World Way W, Los Angeles, CA 90045',
  },
];
