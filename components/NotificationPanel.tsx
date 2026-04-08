'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, X, CheckCircle2, TrendingUp, TrendingDown, Info, ArrowLeftRight } from 'lucide-react';
import { Notification } from '@/lib/types';
import { useI18n } from '@/lib/i18n';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

export default function NotificationPanel() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function fetchNotifs() {
    setLoading(true);
    const res = await fetch('/api/notifications');
    if (res.ok) setNotifs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifs();
    // Poll every 30s for new notifs
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function deleteOne(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifs(prev => prev.filter(n => n.id !== id));
  }

  async function deleteAll() {
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifs([]);
  }

  const unread = notifs.filter(n => !n.read).length;

  function NotifIcon({ type, title }: { type: Notification['type']; title: string }) {
    if (type === 'transaction') {
      if (title.toLowerCase().includes('transfer'))
        return <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0"><ArrowLeftRight size={16} className="text-violet-500" /></div>;
      if (title.toLowerCase().includes('pemasukan'))
        return <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><TrendingUp size={16} className="text-emerald-500" /></div>;
      return <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0"><TrendingDown size={16} className="text-pink-500" /></div>;
    }
    return <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><Info size={16} className="text-blue-500" /></div>;
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifs(); }}
        className="relative p-2 rounded-xl hover:bg-pink-50 text-pink-400 transition-colors"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-pink-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-pink-500" />
                <span className="text-sm font-semibold text-pink-700">{t('notif_title')}</span>
                {unread > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-600 font-medium">{unread} {t('notif_new')}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifs.length > 0 && (
                  <button onClick={deleteAll} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50">
                    {t('notif_delete_all')}
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-pink-50 text-pink-300">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center text-pink-300 text-sm">{t('notif_loading')}</div>
              ) : notifs.length === 0 ? (
                <div className="py-10 text-center">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-pink-200" />
                  <p className="text-sm text-pink-300">{t('notif_empty')}</p>
                </div>
              ) : (
                notifs.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-pink-50 last:border-0 transition-colors ${!n.read ? 'bg-pink-50/60 cursor-pointer hover:bg-pink-50' : 'hover:bg-gray-50'}`}
                  >
                    <NotifIcon type={n.type} title={n.title} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-gray-700 truncate">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteOne(n.id); }}
                      className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
