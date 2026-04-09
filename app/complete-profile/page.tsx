'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Wallet, User } from 'lucide-react';

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      const needsProfile = (session?.user as { needsProfile?: boolean })?.needsProfile;
      // Kalau sudah punya akun (needsProfile false), redirect ke dashboard
      if (needsProfile === false) {
        router.push('/');
        return;
      }
      if (session?.user?.name) setName(session.user.name);
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Nama tidak boleh kosong'); return; }
    setLoading(true);
    setError('');

    const googleId = (session?.user as { googleId?: string })?.googleId;
    const email = session?.user?.email;

    // 1. Buat akun baru di database
    const res = await fetch('/api/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, googleId, email }),
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error || 'Gagal menyimpan profil');
      setLoading(false);
      return;
    }

    // 2. Update next-auth session agar needsProfile jadi false
    await update({ trigger: 'update' });

    // 3. Redirect ke dashboard
    router.push('/');
    router.refresh();
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-pink-300 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-200">
            <Wallet size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-pink-800">DompetKu</h1>
          <p className="text-pink-400 text-sm mt-1">Satu langkah lagi!</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
          {/* Avatar dari Google */}
          {session?.user?.image && (
            <div className="flex justify-center mb-6">
              <img
                src={session.user.image}
                alt="Foto profil"
                className="w-16 h-16 rounded-full border-4 border-pink-200 shadow-md"
              />
            </div>
          )}

          <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Lengkapi Profil</h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            Akun Google kamu berhasil terhubung.<br />
            Masukkan nama yang ingin ditampilkan.
          </p>

          {/* Email dari Google — read only */}
          <div className="mb-4 px-4 py-3 rounded-xl bg-pink-50 border border-pink-100 flex items-center gap-2">
            <span className="text-xs text-pink-400">Email:</span>
            <span className="text-sm font-medium text-pink-700">{session?.user?.email}</span>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-pink-600 mb-1 block">Nama Lengkap</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  placeholder="Nama kamu"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-medium shadow-md shadow-pink-200 disabled:opacity-60"
            >
              {loading ? 'Menyimpan...' : 'Mulai Pakai DompetKu'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
