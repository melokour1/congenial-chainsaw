import { requireRole } from '@/lib/auth';
import { Sidebar } from '@/components/admin/sidebar';
import { SignOutButton } from '@/components/admin/sign-out-button';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole('ADMIN');

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-light-gray/20 bg-[var(--surface)] px-6 py-3">
          <div className="text-sm text-medium-gray">
            Signed in as <span className="font-medium text-white">{profile.fullName}</span>
          </div>
          <SignOutButton />
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
