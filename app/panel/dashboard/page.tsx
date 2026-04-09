'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CreditCard, FileText, UserPlus, LogOut, ShieldCheck,
  Search, Trash2, KeyRound, X, Eye, EyeOff, ChevronUp, ChevronDown,
  RefreshCw, UserCog,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import ConfirmDialog from '@/components/ConfirmDialog';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: 'admin' | 'user';
  transactionCount: number;
  categoryCount: number;
  templateCount: number;
}

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  totalTemplates: number;
  newThisMonth: number;
}

function StatCard({ label, value, icon: Icon, gradient, shadow }: {
  label: string; value: number; icon: React.ElementType; gradient: string; shadow: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-pink-400">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-md ${shadow}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-pink-800">{value}</p>
    </motion.div>
  );
}

function ResetPasswordModal({ user, onClose, onSuccess }: {
  user: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: password }),
    });
    if (res.ok) { onSuccess(); onClose(); }
    else { const d = await res.json(); setError(d.error || 'Gagal reset password'); }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
        className="relative bg-white rounded-3xl border border-pink-100 p-6 w-full max-w-sm shadow-2xl shadow-pink-100"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-pink-800 font-semibold">Reset Password</h3>
            <p className="text-pink-400 text-xs mt-0.5">{user.name} · {user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-pink-50 text-pink-300">
            <X size={16} />
          </button>
        </div>
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-pink-600 mb-1.5 block">Password Baru</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required minLength={6}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                placeholder="Min. 6 karakter"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-400 text-sm hover:bg-pink-50">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-medium shadow-md shadow-pink-200 disabled:opacity-60">
              {loading ? 'Menyimpan...' : 'Reset'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'transactionCount'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [toast, setToast] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.status === 401) { router.push('/panel'); return; }
    const data = await res.json();
    setUsers(data.users || []);
    setStats(data.stats || null);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleDelete(user: AdminUser) {
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) { showToast(`User ${user.name} berhasil dihapus`); fetchData(); }
    else showToast('Gagal menghapus user');
    setDeleteUser(null);
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/panel');
  }

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(col); setSortDir('asc'); }
  }

  const filtered = users
    .filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let va: string | number = a[sortBy];
      let vb: string | number = b[sortBy];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  function SortIcon({ col }: { col: typeof sortBy }) {
    if (sortBy !== col) return <ChevronUp size={12} className="text-pink-200" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-pink-500" />
      : <ChevronDown size={12} className="text-pink-500" />;
  }

  function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8]">
      {/* Topbar */}
      <header className="bg-white border-b border-pink-100 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center shadow-md shadow-pink-200">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-pink-800 text-sm">Admin Panel</span>
            <span className="text-pink-300 text-xs ml-2 hidden sm:inline">· DompetKu</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData}
            className="p-2 rounded-xl hover:bg-pink-50 text-pink-300 hover:text-pink-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <Link href="/panel/profile"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-pink-50 text-pink-400 text-sm transition-colors border border-pink-100">
            <UserCog size={14} />
            <span className="hidden sm:inline">Profil</span>
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-500 text-sm transition-colors border border-pink-100">
            <LogOut size={14} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <main className="p-4 lg:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total User" value={stats.totalUsers} icon={Users}
              gradient="from-pink-400 to-fuchsia-500" shadow="shadow-pink-200" />
            <StatCard label="User Bulan Ini" value={stats.newThisMonth} icon={UserPlus}
              gradient="from-emerald-400 to-teal-500" shadow="shadow-emerald-100" />
            <StatCard label="Total Transaksi" value={stats.totalTransactions} icon={CreditCard}
              gradient="from-violet-400 to-purple-500" shadow="shadow-violet-100" />
            <StatCard label="Total Template" value={stats.totalTemplates} icon={FileText}
              gradient="from-amber-400 to-orange-400" shadow="shadow-amber-100" />
          </div>
        )}

        {/* User table */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-pink-50 flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <h2 className="font-semibold text-pink-800">Daftar User</h2>
              <p className="text-pink-400 text-xs mt-0.5">{filtered.length} user terdaftar</p>
            </div>
            <div className="sm:ml-auto relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="pl-9 pr-4 py-2 rounded-xl border border-pink-200 text-sm placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 rounded-full border-4 border-pink-100 border-t-pink-400 animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="mx-auto mb-3 text-pink-200" />
              <p className="text-pink-300 text-sm">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pink-50 bg-pink-50/50">
                      {[
                        { label: 'Nama', col: 'name' as const },
                        { label: 'Email', col: null },
                        { label: 'Role', col: null },
                        { label: 'Tgl Daftar', col: 'createdAt' as const },
                        { label: 'Transaksi', col: 'transactionCount' as const },
                        { label: 'Kategori', col: null },
                        { label: 'Template', col: null },
                        { label: 'Aksi', col: null },
                      ].map(({ label, col }) => (
                        <th key={label}
                          onClick={() => col && toggleSort(col)}
                          className={`text-left px-5 py-3.5 text-xs font-semibold text-pink-500 ${col ? 'cursor-pointer hover:text-pink-700 select-none' : ''}`}
                        >
                          <span className="flex items-center gap-1">
                            {label}
                            {col && <SortIcon col={col} />}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-pink-50 hover:bg-pink-50/40 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {getInitials(user.name)}
                            </div>
                            <span className="font-medium text-gray-700">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-400">{user.email}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                            user.role === 'admin'
                              ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'
                              : 'bg-pink-50 text-pink-500 border-pink-100'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-500 text-xs font-medium border border-pink-100">
                            {user.transactionCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-gray-400">{user.categoryCount}</td>
                        <td className="px-5 py-4 text-gray-400">{user.templateCount}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setResetUser(user)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-500 text-xs border border-fuchsia-100 transition-colors"
                            >
                              <KeyRound size={12} /> Reset
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => setDeleteUser(user)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-xs border border-red-200 transition-colors"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-pink-50">
                {filtered.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 space-y-3"
                  >
                      <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-xs font-bold text-white">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 text-sm">{user.name}</p>
                          <p className="text-pink-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="text-pink-400">Daftar: {formatDate(user.createdAt)}</span>
                      <span className={`px-2 py-0.5 rounded-lg border text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100'
                          : 'bg-pink-50 text-pink-500 border-pink-100'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-pink-50 text-pink-500 border border-pink-100">
                        {user.transactionCount} transaksi
                      </span>
                    </div>
                    <button
                      onClick={() => setResetUser(user)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-500 text-xs border border-fuchsia-100 transition-colors"
                    >
                      <KeyRound size={13} /> Reset Password
                    </button>
                    {user.role !== 'admin' && (
                      <button onClick={() => setDeleteUser(user)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 text-xs border border-red-200 transition-colors">
                        <Trash2 size={13} /> Hapus
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Reset password modal */}
      <AnimatePresence>
        {resetUser && (
          <ResetPasswordModal
            user={resetUser}
            onClose={() => setResetUser(null)}
            onSuccess={() => showToast(`Password ${resetUser.name} berhasil direset`)}
          />
        )}
      </AnimatePresence>

      {/* Confirm hapus user */}
      <ConfirmDialog
        open={!!deleteUser}
        title={`Hapus "${deleteUser?.name}"?`}
        message={`Semua data user ini (transaksi, kategori, template) akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus User"
        cancelLabel="Batal"
        onConfirm={() => deleteUser && handleDelete(deleteUser)}
        onCancel={() => setDeleteUser(null)}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-pink-500 text-white text-sm shadow-xl shadow-pink-200 z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
