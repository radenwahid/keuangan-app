'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Pencil, Check, X, KeyRound, User, Trash2 } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useI18n } from '@/lib/i18n';
import ConfirmDialog from '@/components/ConfirmDialog';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
      setProfile(d);
      setNewName(d.name);
    });
  }, []);

  async function saveName() {
    if (!newName.trim()) return;
    setLoadingName(true);
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) });
    if (res.ok) {
      const d = await res.json();
      setProfile(d);
      setEditName(false);
      showToast(t('profile_name_updated'));
    } else showToast(t('profile_name_fail'), 'error');
    setLoadingName(false);
  }

  async function deleteAccount() {
    setDeletingAccount(true);
    const res = await fetch('/api/profile/delete', { method: 'DELETE' });
    if (res.ok) {
      router.push('/login');
      router.refresh();
    } else {
      showToast('Gagal menghapus akun', 'error');
      setDeletingAccount(false);
    }
    setShowDeleteConfirm(false);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast(t('profile_pw_mismatch'), 'error'); return; }
    if (newPassword.length < 6) { showToast(t('profile_pw_short'), 'error'); return; }
    setLoadingPw(true);
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldPassword, newPassword }) });
    if (res.ok) {
      showToast(t('profile_pw_updated'));
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
      const e = await res.json();
      showToast(e.error || t('profile_pw_mismatch'), 'error');
    }
    setLoadingPw(false);
  }

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-4 border-pink-300 border-t-pink-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-pink-800">{t('profile_title')}</h1>
        <p className="text-pink-400 text-sm">{t('profile_subtitle')}</p>
      </div>

      {/* Avatar & info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-pink-200">
            {getInitials(profile.name)}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">{profile.name}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <p className="text-xs text-pink-400 mt-1">{t('profile_joined')} {formatDate(profile.createdAt)}</p>
          </div>
        </div>

        {/* Edit name */}
        <div>
          <label className="text-xs font-medium text-pink-600 mb-2 block flex items-center gap-1">
            <User size={12} /> {t('profile_full_name')}
          </label>
          {editName ? (
            <div className="flex gap-2">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
              <button onClick={saveName} disabled={loadingName}
                className="p-2.5 rounded-xl bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-60">
                <Check size={16} />
              </button>
              <button onClick={() => { setEditName(false); setNewName(profile.name); }}
                className="p-2.5 rounded-xl border border-pink-200 text-pink-400 hover:bg-pink-50">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-pink-50 border border-pink-100">
              <span className="text-sm text-gray-700">{profile.name}</span>
              <button onClick={() => setEditName(true)} className="text-pink-400 hover:text-pink-600">
                <Pencil size={15} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-pink-600 mb-2 block">{t('profile_email')}</label>
          <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500">
            {profile.email}
          </div>
        </div>
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
        <h2 className="text-sm font-semibold text-pink-700 mb-4 flex items-center gap-2">
          <KeyRound size={16} /> {t('profile_change_password')}
        </h2>
        <form onSubmit={savePassword} className="space-y-4">
          {[
            { label: t('profile_old_password'), value: oldPassword, onChange: setOldPassword },
            { label: t('profile_new_password'), value: newPassword, onChange: setNewPassword },
            { label: t('profile_confirm_password'), value: confirmPassword, onChange: setConfirmPassword },
          ].map(field => (
            <div key={field.label}>
              <label className="text-xs font-medium text-pink-600 mb-1 block">{field.label}</label>
              <input type="password" value={field.value} onChange={e => field.onChange(e.target.value)} required
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
            </div>
          ))}
          <button type="submit" disabled={loadingPw}
            className="w-full py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-medium shadow-md shadow-pink-200 disabled:opacity-60">
            {loadingPw ? t('profile_saving') : t('profile_save_password')}
          </button>
        </form>
      </motion.div>

      {/* Danger zone — hapus akun */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm">
        <h2 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-2">
          <Trash2 size={16} /> Hapus Akun
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Akun dan semua data kamu (transaksi, kategori, template) akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Hapus Akun Saya
        </button>
      </motion.div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Hapus Akun?"
        message={`Semua data akun "${profile?.name}" akan dihapus permanen termasuk seluruh transaksi, kategori, dan template. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel={deletingAccount ? 'Menghapus...' : 'Ya, Hapus Akun'}
        cancelLabel="Batal"
        onConfirm={deleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
