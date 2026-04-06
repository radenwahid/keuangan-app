'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, User, LogOut, RefreshCw, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // Password form
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  // Username form
  const [newUsername, setNewUsername] = useState('');
  const [unPassword, setUnPassword] = useState('');
  const [unLoading, setUnLoading] = useState(false);
  const [unError, setUnError] = useState('');
  const [unSuccess, setUnSuccess] = useState(false);

  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  useEffect(() => {
    fetch('/api/admin/profile')
      .then((r) => {
        if (r.status === 401) { router.push('/panel'); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) { setUsername(d.username); setNewUsername(d.username); }
        setLoading(false);
      });
  }, [router]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (newPw !== confirmPw) { setPwError('Konfirmasi password tidak cocok'); return; }
    if (newPw.length < 6) { setPwError('Password minimal 6 karakter'); return; }
    setPwLoading(true);
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'password', oldPassword: oldPw, newPassword: newPw }),
    });
    const d = await res.json();
    if (res.ok) {
      setPwSuccess(true);
      setOldPw(''); setNewPw(''); setConfirmPw('');
      showToast('Password berhasil diubah');
      setTimeout(() => setPwSuccess(false), 3000);
    } else {
      setPwError(d.error || 'Gagal mengubah password');
    }
    setPwLoading(false);
  }

  async function handleChangeUsername(e: React.FormEvent) {
    e.preventDefault();
    setUnError('');
    if (!newUsername.trim()) { setUnError('Username tidak boleh kosong'); return; }
    setUnLoading(true);
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'username', currentPassword: unPassword, newUsername }),
    });
    const d = await res.json();
    if (res.ok) {
      setUsername(newUsername);
      setUnPassword('');
      setUnSuccess(true);
      showToast('Username berhasil diubah, silakan login ulang');
      setTimeout(async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/panel');
      }, 2000);
    } else {
      setUnError(d.error || 'Gagal mengubah username');
    }
    setUnLoading(false);
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/panel');
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-pink-100 border-t-pink-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF2F8]">
      {/* Topbar */}
      <header className="bg-white border-b border-pink-100 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center shadow-md shadow-pink-200">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-bold text-pink-800 text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/panel/dashboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-pink-50 text-pink-400 text-sm transition-colors">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-500 text-sm border border-pink-100">
            <LogOut size={14} /> <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-pink-800">Profil Admin</h1>
          <p className="text-pink-400 text-sm mt-0.5">Kelola kredensial akun admin</p>
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-pink-200">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{username}</p>
            <span className="text-xs px-2.5 py-1 rounded-full bg-pink-100 text-pink-600 font-medium">Administrator</span>
          </div>
        </motion.div>

        {/* Ganti password */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
          <h2 className="text-sm font-semibold text-pink-700 mb-4 flex items-center gap-2">
            <KeyRound size={16} /> Ganti Password
          </h2>
          {pwError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">{pwError}</div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { label: 'Password Lama', value: oldPw, set: setOldPw },
              { label: 'Password Baru', value: newPw, set: setNewPw },
              { label: 'Konfirmasi Password Baru', value: confirmPw, set: setConfirmPw },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-medium text-pink-600 mb-1 block">{f.label}</label>
                <input type="password" value={f.value} onChange={(e) => f.set(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
              </div>
            ))}
            <button type="submit" disabled={pwLoading}
              className={`w-full py-2.5 rounded-full text-white text-sm font-medium shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                pwSuccess ? 'bg-emerald-500 shadow-emerald-200' : 'bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-pink-200'
              }`}>
              {pwSuccess ? <><Check size={16} /> Berhasil</> : pwLoading ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </form>
        </motion.div>

        {/* Ganti username */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
          <h2 className="text-sm font-semibold text-pink-700 mb-1 flex items-center gap-2">
            <User size={16} /> Ganti Username
          </h2>
          <p className="text-xs text-pink-300 mb-4">Setelah ganti username, kamu akan otomatis logout</p>
          {unError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">{unError}</div>
          )}
          <form onSubmit={handleChangeUsername} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-pink-600 mb-1 block">Username Baru</label>
              <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-pink-600 mb-1 block">Konfirmasi dengan Password</label>
              <input type="password" value={unPassword} onChange={(e) => setUnPassword(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                placeholder="Masukkan password kamu" />
            </div>
            <button type="submit" disabled={unLoading}
              className={`w-full py-2.5 rounded-full text-white text-sm font-medium shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                unSuccess ? 'bg-emerald-500 shadow-emerald-200' : 'bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-pink-200'
              }`}>
              {unSuccess ? <><Check size={16} /> Berhasil, mengalihkan...</> : unLoading ? 'Menyimpan...' : 'Ubah Username'}
            </button>
          </form>
        </motion.div>
      </main>

      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-pink-500 text-white text-sm shadow-xl shadow-pink-200 z-50">
          {toast}
        </motion.div>
      )}
    </div>
  );
}
