import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/Toast';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FDF2F8]">
        <Sidebar userName={user.name} userEmail={user.email} />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
