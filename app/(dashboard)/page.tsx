'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Transaction, Category } from '@/lib/types';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';
import CategoryIcon from '@/components/CategoryIcon';
import { SkeletonCard, SkeletonList } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function DashboardPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [txRes, catRes] = await Promise.all([
      fetch(`/api/transactions?month=${month}&year=${year}`),
      fetch('/api/categories'),
    ]);
    setTransactions(await txRes.json());
    setCategories(await catRes.json());
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Daily chart data
  const dailyMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(t => {
    const day = new Date(t.date).getDate().toString();
    if (!dailyMap[day]) dailyMap[day] = { income: 0, expense: 0 };
    if (t.type === 'income') dailyMap[day].income += t.amount;
    else dailyMap[day].expense += t.amount;
  });
  const dailyData = Object.entries(dailyMap).map(([day, v]) => ({ day, ...v })).sort((a, b) => parseInt(a.day) - parseInt(b.day));

  // Pie chart data
  const catMap: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
  const PIE_COLORS = ['#EC4899','#F9A8D4','#A855F7','#FB923C','#34D399','#60A5FA','#FBBF24','#F87171'];

  const recent = [...transactions].slice(0, 5);

  async function handleAddTransaction(data: Partial<Transaction>) {
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast('Transaksi berhasil ditambahkan'); setShowModal(false); fetchData(); }
    else showToast('Gagal menambahkan transaksi', 'error');
  }

  function getCategoryColor(name: string) {
    return categories.find(c => c.name === name)?.color || '#EC4899';
  }
  function getCategoryIcon(name: string) {
    return categories.find(c => c.name === name)?.icon || 'Tag';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-800">Beranda</h1>
          <p className="text-pink-400 text-sm mt-0.5">Ringkasan keuangan kamu</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-pink-100 px-3 py-2 shadow-sm">
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-pink-50 text-pink-400"><ChevronLeft size={16} /></button>
          <span className="text-sm font-medium text-pink-700 min-w-[120px] text-center">{MONTHS[month - 1]} {year}</span>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-pink-50 text-pink-400"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Pemasukan', value: totalIncome, icon: TrendingUp, color: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
            { label: 'Total Pengeluaran', value: totalExpense, icon: TrendingDown, color: 'from-pink-400 to-rose-400', bg: 'bg-pink-50', text: 'text-pink-700' },
            { label: 'Saldo Bersih', value: balance, icon: Wallet, color: 'from-violet-400 to-purple-400', bg: 'bg-violet-50', text: 'text-violet-700' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`${card.bg} rounded-2xl p-5 border border-white shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon size={16} className="text-white" />
                </div>
              </div>
              <p className={`text-xl font-bold ${card.text}`}>{formatRupiah(card.value)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
          <h3 className="text-sm font-semibold text-pink-700 mb-4">Pemasukan vs Pengeluaran Harian</h3>
          {dailyData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-pink-300 text-sm">Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyData}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Bar dataKey="income" fill="#34D399" radius={[4,4,0,0]} name="Pemasukan" />
                <Bar dataKey="expense" fill="#F9A8D4" radius={[4,4,0,0]} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
          <h3 className="text-sm font-semibold text-pink-700 mb-4">Pengeluaran per Kategori</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-pink-300 text-sm">Belum ada pengeluaran</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
        <h3 className="text-sm font-semibold text-pink-700 mb-4">Transaksi Terbaru</h3>
        {loading ? <SkeletonList count={3} /> : recent.length === 0 ? (
          <div className="py-8 text-center text-pink-300">
            <Wallet size={40} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Belum ada transaksi bulan ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-pink-50 transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: getCategoryColor(t.category) + '20' }}>
                  <CategoryIcon icon={getCategoryIcon(t.category)} size={16} style={{ color: getCategoryColor(t.category) }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{t.category}</p>
                  <p className="text-xs text-gray-400 truncate">{t.note || formatDate(t.date)}</p>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-pink-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* FAB */}
      <motion.button
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-500 text-white shadow-lg shadow-pink-300 flex items-center justify-center z-40"
      >
        <Plus size={24} />
      </motion.button>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tambah Transaksi">
        <TransactionForm onSubmit={handleAddTransaction} onClose={() => setShowModal(false)} categories={categories} />
      </Modal>
    </div>
  );
}
