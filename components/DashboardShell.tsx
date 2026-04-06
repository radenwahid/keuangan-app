'use client';
import { createContext, useContext, useState } from 'react';
import { ToastProvider } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';

export const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export function useSidebar() { return useContext(SidebarContext); }

interface Props {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function DashboardShell({ userName, userEmail, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <ToastProvider>
        <div className="min-h-screen bg-[#FDF2F8]">
          <Sidebar userName={userName} userEmail={userEmail} />
          <main className={`min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </SidebarContext.Provider>
  );
}
