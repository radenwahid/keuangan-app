'use client';
import { createContext, useContext, useState } from 'react';
import { ToastProvider } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import OnboardingTour from '@/components/OnboardingTour';
import NotificationPanel from '@/components/NotificationPanel';
import UserMenu from '@/components/UserMenu';

export const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export function useSidebar() { return useContext(SidebarContext); }

interface Props {
  userName: string;
  userEmail: string;
  onboardingDone: boolean;
  children: React.ReactNode;
}

export default function DashboardShell({ userName, userEmail, onboardingDone, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!onboardingDone);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <ToastProvider>
        <div className="min-h-screen bg-[#FDF2F8]">
          <Sidebar userName={userName} userEmail={userEmail} />
          <main className={`min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            {/* Topbar */}
            <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8 bg-[#FDF2F8]/80 backdrop-blur-md border-b border-pink-100/60">
              <div className="w-8 lg:hidden" />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <NotificationPanel />
                <div className="w-px h-5 bg-pink-200" />
                <UserMenu userName={userName} userEmail={userEmail} />
              </div>
            </div>
            <div className="p-4 lg:p-8">{children}</div>
          </main>
        </div>
        {showOnboarding && <OnboardingTour onDone={() => setShowOnboarding(false)} />}
      </ToastProvider>
    </SidebarContext.Provider>
  );
}
