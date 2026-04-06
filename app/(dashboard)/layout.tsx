import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { readJSONAsync } from '@/lib/db';
import { User } from '@/lib/types';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthUser();
  if (!auth) redirect('/login');

  const users = await readJSONAsync<User>('users.json');
  const user = users.find(u => u.id === auth.userId);

  return (
    <DashboardShell
      userName={auth.name}
      userEmail={auth.email}
      onboardingDone={user?.onboardingDone ?? false}
    >
      {children}
    </DashboardShell>
  );
}
