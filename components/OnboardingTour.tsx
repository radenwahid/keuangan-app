'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, CreditCard, Tag, FileText, BarChart2, User,
  ChevronRight, ChevronLeft, X, Wallet, Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    icon: Sparkles,
    color: 'from-pink-400 to-fuchsia-500',
    title: 'Selamat datang di DompetKu! 🎉',
    desc: 'Aplikasi pencatat keuangan pribadi yang simpel dan cantik. Yuk, kenalan dulu sama fitur-fiturnya!',
  },
  {
    icon: Home,
    color: 'from-violet-400 to-purple-500',
    title: 'Beranda',
    desc: 'Lihat ringkasan keuangan bulan ini — total pemasukan, pengeluaran, saldo bersih, serta saldo Cash dan Bank/E-Wallet kamu secara terpisah.',
  },
  {
    icon: CreditCard,
    color: 'from-pink-400 to-rose-500',
    title: 'Transaksi',
    desc: 'Catat setiap pemasukan dan pengeluaran. Pilih dari mana uangnya (Cash atau Bank/E-Wallet), tambah kategori, catatan, dan tanggal. Bisa export ke PDF atau Excel juga!',
  },
  {
    icon: Tag,
    color: 'from-amber-400 to-orange-500',
    title: 'Kategori',
    desc: 'Kelola kategori transaksi kamu. Sudah ada kategori default, tapi kamu bebas tambah, edit, atau hapus sesuai kebutuhan.',
  },
  {
    icon: FileText,
    color: 'from-teal-400 to-emerald-500',
    title: 'Template',
    desc: 'Simpan transaksi yang sering berulang sebagai template. Saat input transaksi baru, tinggal muat template dan semua field terisi otomatis.',
  },
  {
    icon: BarChart2,
    color: 'from-blue-400 to-indigo-500',
    title: 'Laporan',
    desc: 'Lihat grafik dan ringkasan keuangan per periode. Analisis pola pengeluaran dan pemasukan kamu dengan mudah.',
  },
  {
    icon: User,
    color: 'from-pink-400 to-fuchsia-500',
    title: 'Profil',
    desc: 'Ubah nama dan password akun kamu kapan saja dari halaman profil.',
  },
  {
    icon: Wallet,
    color: 'from-emerald-400 to-teal-500',
    title: 'Siap mulai!',
    desc: 'Kamu sudah tahu semua fiturnya. Mulai catat transaksi pertamamu sekarang dengan tombol + di halaman Transaksi atau Beranda. Semangat!',
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingTour({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  async function finish() {
    await fetch('/api/onboarding', { method: 'POST' });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Skip */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 z-10"
        >
          <X size={18} />
        </button>

        {/* Icon header */}
        <div className={`bg-gradient-to-br ${current.color} px-6 pt-10 pb-8 flex flex-col items-center`}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <current.icon size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white text-center">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 text-center leading-relaxed">{current.desc}</p>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {STEPS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? 'w-5 h-2 bg-pink-500' : 'w-2 h-2 bg-pink-200'}`} />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-5">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50"
              >
                <ChevronLeft size={16} /> Kembali
              </button>
            )}
            <button
              onClick={isLast ? finish : () => setStep(s => s + 1)}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-semibold shadow-md shadow-pink-200"
            >
              {isLast ? 'Mulai Sekarang' : (<>Lanjut <ChevronRight size={16} /></>)}
            </button>
          </div>

          <button onClick={finish} className="w-full text-center text-xs text-gray-400 mt-3 hover:text-gray-600">
            Lewati tutorial
          </button>
        </div>
      </motion.div>
    </div>
  );
}
