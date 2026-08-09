import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LAXValetCare',
  description: 'Valet, reinvented. Airport valet at LAX and vehicle rentals — on your terms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
