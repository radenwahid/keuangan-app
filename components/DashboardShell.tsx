'use client';
import { createContext, useContext, useState } from 'react';
import { ToastProvider } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import OnboardingTour from '@/components/OnboardingTour';
import NotificationPanel from '@/components/NotificationPanel';
import UserMenu from '@/components/UserMenu';
import { Eye, EyeOff } from 'lucide-react';

export const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export function useSidebar() { return useContext(SidebarContext); }

export const BalanceContext = createContext<{
  hidden: boolean;
  toggle: () => void;
}>({ hidden: false, toggle: () => {} });

export function useBalance() { return useContext(BalanceContext); }

interface Props {
  userName: string;
  userEmail: string;
  onboardingDone: boolean;
  children: React.ReactNode;
}

export default function DashboardShell({ userName, userEmail, onboardingDone, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(!onboardingDone);
  const [hidden, setHidden] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <BalanceContext.Provider value={{ hidden, toggle: () => setHidden(h => !h) }}>
        <ToastProvider>
          <div className="min-h-screen bg-[#FDF2F8]">
            <Sidebar userName={userName} userEmail={userEmail} />
            <main className={`min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
              {/* Topbar */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8 bg-[#FDF2F8]/80 backdrop-blur-md border-b border-pink-100/60">
                <div className="w-8 lg:hidden" />
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHidden(h => !h)}
                    title={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                    className="p-2 rounded-xl hover:bg-pink-100 text-pink-400 transition-colors"
                  >
                    {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <div className="w-px h-5 bg-pink-200" />
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
      </BalanceContext.Provider>
    </SidebarContext.Provider>
  );
}
