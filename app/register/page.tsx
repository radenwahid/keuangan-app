'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return;
    const user = session.user as { needsProfile?: boolean; email?: string; fromGoogle?: boolean };
    if (!user.fromGoogle) return;

    if (user.needsProfile) {
      router.push('/complete-profile');
    } else if (user.email) {
      fetch('/api/auth/google-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      }).then(() => {
        window.location.href = '/';
      });
    }
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Konfirmasi password tidak cocok'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter'); return; }
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError(data.error || 'Registrasi gagal');
    }
    setLoading(false);
  }

  async function handleGoogleRegister() {
    setGoogleLoading(true);
    setError('');
    await signIn('google', { callbackUrl: '/register' });
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
          <p className="text-pink-400 text-sm mt-1">Mulai kelola keuanganmu</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Daftar Akun</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-pink-600 mb-1 block">Nama Lengkap</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                placeholder="Nama kamu" />
            </div>
            <div>
              <label className="text-xs font-medium text-pink-600 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                placeholder="email@contoh.com" />
            </div>
            <div>
              <label className="text-xs font-medium text-pink-600 mb-1 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                  placeholder="Min. 6 karakter" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300 hover:text-pink-500">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-pink-600 mb-1 block">Konfirmasi Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                placeholder="Ulangi password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-medium shadow-md shadow-pink-200 disabled:opacity-60 mt-2">
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Tombol Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-all shadow-sm disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
            )}
            {googleLoading ? 'Menghubungkan...' : 'Daftar dengan Google'}
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-pink-500 font-medium hover:underline">Masuk</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
