import { requireRole } from '@/lib/auth';
import { ValetShell } from '@/components/valet/ValetShell';

/** Gates the entire /valet section to signed-in VALET users; clocked-out valets see only a clock-in screen (spec 4.1). */
export default async function ValetLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole('VALET', '/login');

  return <ValetShell initialProfile={profile}>{children}</ValetShell>;
}
