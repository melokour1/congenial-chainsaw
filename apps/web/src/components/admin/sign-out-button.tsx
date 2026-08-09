'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
      }}
      className="rounded-card border border-light-gray/30 px-4 py-2 text-sm font-medium text-medium-gray transition-opacity hover:opacity-80"
    >
      Sign out
    </button>
  );
}
