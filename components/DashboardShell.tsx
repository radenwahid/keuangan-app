'use client';
import { ToastProvider } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';

interface Props {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function DashboardShell({ userName, userEmail, children }: Props) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FDF2F8]">
        <Sidebar userName={userName} userEmail={userEmail} />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
