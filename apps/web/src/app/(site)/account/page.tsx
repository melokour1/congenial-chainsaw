import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { Card } from '@/components/ui';
import { SignOutButton } from '@/components/admin/sign-out-button';

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login?next=/account');

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <Card className="border border-light-gray dark:border-[#2A2A2A]">
        <h3 className="font-display text-lg font-bold">Account</h3>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-medium-gray">Name</dt>
            <dd className="font-medium">{profile.fullName}</dd>
          </div>
          <div>
            <dt className="text-medium-gray">Email</dt>
            <dd className="font-medium">{profile.email}</dd>
          </div>
          {profile.phone && (
            <div>
              <dt className="text-medium-gray">Phone</dt>
              <dd className="font-medium">{profile.phone}</dd>
            </div>
          )}
          <div>
            <dt className="text-medium-gray">Role</dt>
            <dd className="font-medium">{profile.role}</dd>
          </div>
        </dl>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </Card>
    </div>
  );
}
