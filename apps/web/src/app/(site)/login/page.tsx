import { Suspense } from 'react';
import { AuthForm } from '@/components/site/auth-form';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <Suspense fallback={<p className="text-sm text-medium-gray">Loading…</p>}>
        <AuthForm initialMode="signin" />
      </Suspense>
    </div>
  );
}
