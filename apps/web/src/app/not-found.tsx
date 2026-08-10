import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
      <span className="font-display text-sm font-bold text-medium-gray">404</span>
      <h1 className="font-display text-3xl font-bold">Page not found</h1>
      <p className="max-w-sm text-medium-gray">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <Link href="/" className="mt-4 rounded-card bg-white px-6 py-3 text-sm font-medium text-black hover:opacity-80">
        Back to home
      </Link>
    </div>
  );
}
