'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
      <span className="font-display text-sm font-bold text-medium-gray">ERROR</span>
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-medium-gray">
        We hit an unexpected error. Try again, or head back to the homepage.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={reset}
          className="rounded-card bg-white px-6 py-3 text-sm font-medium text-black hover:opacity-80"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-card border border-white px-6 py-3 text-sm font-medium text-white hover:opacity-80"
        >
          Home
        </a>
      </div>
    </div>
  );
}
