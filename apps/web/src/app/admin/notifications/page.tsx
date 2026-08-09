import { createAdminClient } from '@/lib/supabase/admin';
import { NotificationsTable } from '@/components/admin/notifications-table';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('notifications')
    .select('id, title, body, type, sentVia, createdAt, profile:profiles(fullName)')
    .order('createdAt', { ascending: false })
    .limit(500);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-medium-gray">Everything sent to customers and valets.</p>
      </div>
      <NotificationsTable notifications={(data ?? []) as any} />
    </div>
  );
}
