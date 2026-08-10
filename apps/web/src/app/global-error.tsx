'use client';

import { useEffect } from 'react';

/** Catches errors thrown by the root layout itself — must render its own <html>/<body>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
          <span className="font-display text-sm font-bold text-medium-gray">ERROR</span>
          <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
          <p className="max-w-sm text-medium-gray">The app failed to load. Try again.</p>
          <button
            onClick={reset}
            className="mt-4 rounded-card bg-white px-6 py-3 text-sm font-medium text-black hover:opacity-80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
