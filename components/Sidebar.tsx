'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, CreditCard, Tag, FileText, BarChart2, User, LogOut, Menu, X, Wallet, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { getInitials } from '@/lib/utils';
import { useSidebar } from '@/components/DashboardShell';

const navItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/transactions', label: 'Transaksi', icon: CreditCard },
  { href: '/categories', label: 'Kategori', icon: Tag },
  { href: '/templates', label: 'Template', icon: FileText },
  { href: '/reports', label: 'Laporan', icon: BarChart2 },
  { href: '/profile', label: 'Profil', icon: User },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

function DesktopSidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = useSidebar();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <aside className={`hidden lg:flex flex-col min-h-screen bg-white border-r border-pink-100 fixed left-0 top-0 z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo */}
      <div className={`p-4 border-b border-pink-100 flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-6'}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center flex-shrink-0">
          <Wallet size={18} className="text-white" />
        </div>
        {!collapsed && <span className="font-bold text-pink-700 text-lg">DompetKu</span>}
      </div>

      {/* User */}
      {!collapsed ? (
        <div className="p-4 mx-3 mt-4 rounded-2xl bg-pink-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {getInitials(userName)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-pink-800 truncate">{userName}</p>
            <p className="text-xs text-pink-400 truncate">{userEmail}</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm">
            {getInitials(userName)}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 mt-2 space-y-1">
        {navItems.map((item, i) => {
          const active = pathname === item.href;
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium ${collapsed ? 'justify-center' : ''} ${
                  active
                    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md shadow-pink-200'
                    : 'text-pink-600 hover:bg-pink-50'
                }`}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Keluar' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && 'Keluar'}
        </button>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-pink-200 shadow-sm flex items-center justify-center text-pink-400 hover:text-pink-600 hover:border-pink-400 transition-all"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      <DesktopSidebar userName={userName} userEmail={userEmail} />

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="p-2.5 rounded-xl bg-white shadow-md border border-pink-100 text-pink-500"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-pink-50 text-pink-400"
              >
                <X size={20} />
              </button>

              {/* Logo */}
              <div className="p-6 border-b border-pink-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center">
                    <Wallet size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-pink-700 text-lg">DompetKu</span>
                </div>
              </div>

              {/* User */}
              <div className="p-4 mx-3 mt-4 rounded-2xl bg-pink-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(userName)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-pink-800 truncate">{userName}</p>
                  <p className="text-xs text-pink-400 truncate">{userEmail}</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 p-3 mt-2 space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                        active
                          ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md shadow-pink-200'
                          : 'text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout */}
              <div className="p-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-all"
                >
                  <LogOut size={18} />
                  Keluar
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
