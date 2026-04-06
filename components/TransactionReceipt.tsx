'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, CreditCard, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction, Category } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import CategoryIcon from './CategoryIcon';

interface Props {
  transaction: Transaction | null;
  categories: Category[];
  onClose: () => void;
}

export default function TransactionReceipt({ transaction: t, categories, onClose }: Props) {
  if (!t) return null;

  const cat = categories.find(c => c.name === t.category);
  const catColor = cat?.color || '#EC4899';
  const catIcon = cat?.icon || 'Tag';
  const isIncome = t.type === 'income';

  const receiptId = t.id.slice(-8).toUpperCase();
  const createdAt = t.createdAt
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(t.createdAt))
    : '-';

  return (
    <AnimatePresence>
      {t && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Receipt */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative w-full max-w-sm z-10"
          >
            {/* Receipt paper */}
            <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden">
              {/* Header strip */}
              <div
                className="px-6 pt-8 pb-6 text-white text-center"
                style={{ background: isIncome ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ec4899, #d946ef)' }}
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                  {isIncome
                    ? <ArrowDownLeft size={28} className="text-white" />
                    : <ArrowUpRight size={28} className="text-white" />
                  }
                </div>
                <p className="text-sm font-medium opacity-80">{isIncome ? 'Pemasukan' : 'Pengeluaran'}</p>
                <p className="text-3xl font-bold mt-1">
                  {isIncome ? '+' : '-'}{formatRupiah(t.amount)}
                </p>
              </div>

              {/* Zigzag edge */}
              <div className="relative h-4 overflow-hidden -mt-1">
                <svg viewBox="0 0 400 16" preserveAspectRatio="none" className="w-full h-full"
                  style={{ fill: isIncome ? '#059669' : '#d946ef' }}>
                  <path d="M0,0 L20,16 L40,0 L60,16 L80,0 L100,16 L120,0 L140,16 L160,0 L180,16 L200,0 L220,16 L240,0 L260,16 L280,0 L300,16 L320,0 L340,16 L360,0 L380,16 L400,0 L400,0 L0,0 Z" />
                </svg>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-0">
                {/* No struk */}
                <div className="text-center mb-4">
                  <p className="text-xs text-gray-400 font-mono">#{receiptId}</p>
                </div>

                {/* Category */}
                <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-400">Kategori</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: catColor + '20' }}>
                      <CategoryIcon icon={catIcon} size={12} style={{ color: catColor }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{t.category}</span>
                  </div>
                </div>

                {/* Wallet */}
                <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-400">{isIncome ? 'Masuk ke' : 'Bayar dari'}</span>
                  <div className="flex items-center gap-1.5">
                    {t.walletType === 'bank'
                      ? <CreditCard size={14} className="text-blue-500" />
                      : <Banknote size={14} className="text-amber-500" />
                    }
                    <span className="text-sm font-medium text-gray-700">
                      {t.walletType === 'bank' ? 'Bank / E-Wallet' : 'Cash'}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200">
                  <span className="text-xs text-gray-400">Tanggal</span>
                  <span className="text-sm font-medium text-gray-700">{formatDate(t.date)}</span>
                </div>

                {/* Note */}
                {t.note && (
                  <div className="flex items-start justify-between py-3 border-b border-dashed border-gray-200">
                    <span className="text-xs text-gray-400">Catatan</span>
                    <span className="text-sm font-medium text-gray-700 text-right max-w-[60%]">{t.note}</span>
                  </div>
                )}

                {/* Created at */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-xs text-gray-400">Dicatat</span>
                  <span className="text-xs text-gray-500 font-mono">{createdAt}</span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-center gap-2 py-3 mt-1 bg-gray-50 rounded-xl">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">Transaksi Tercatat</span>
                </div>
              </div>

              {/* Bottom zigzag */}
              <div className="relative h-4 overflow-hidden">
                <svg viewBox="0 0 400 16" preserveAspectRatio="none" className="w-full h-full fill-white">
                  <path d="M0,16 L20,0 L40,16 L60,0 L80,16 L100,0 L120,16 L140,0 L160,16 L180,0 L200,16 L220,0 L240,16 L260,0 L280,16 L300,0 L320,16 L340,0 L360,16 L380,0 L400,16 Z" />
                </svg>
              </div>
            </div>

            {/* Torn edge gap */}
            <div className="h-2 bg-transparent" />

            {/* Close button as separate "tear" */}
            <div className="bg-white rounded-b-3xl shadow-2xl">
              <button
                onClick={onClose}
                className="w-full py-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={16} />
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
