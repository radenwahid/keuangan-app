'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Props {
  userName: string;
  userEmail: string;
}

export default function UserMenu({ userName, userEmail }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-pink-100/60 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {getInitials(userName)}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-pink-800 leading-tight max-w-[120px] truncate">{userName}</p>
          <p className="text-[10px] text-pink-400 max-w-[120px] truncate">{userEmail}</p>
        </div>
        <ChevronDown size={14} className={`hidden sm:block text-pink-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-pink-100 z-50 overflow-hidden"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-pink-100 bg-pink-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {getInitials(userName)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-pink-800 truncate">{userName}</p>
                  <p className="text-xs text-pink-400 truncate">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-pink-700 hover:bg-pink-50 transition-colors"
              >
                <User size={15} className="text-pink-400" />
                Lihat Profil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} className="text-red-400" />
                Keluar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
