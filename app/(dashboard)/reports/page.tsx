'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatRupiah, formatDate } from '@/lib/utils';
import { Transaction } from '@/lib/types';
import { SkeletonCard } from '@/components/Skeleton';
import { useFetch } from '@/lib/useFetch';
import { useBalance } from '@/components/DashboardShell';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const PIE_COLORS = ['#EC4899','#F9A8D4','#A855F7','#FB923C','#34D399','#60A5FA','#FBBF24','#F87171'];

interface ReportData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  daily: { date: string; income: number; expense: number }[];
  byCategory: { name: string; value: number }[];
  transactions: Transaction[];
}

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const reportUrl = `/api/reports?month=${month}&year=${year}`;
  const { data, loading } = useFetch<ReportData>(reportUrl, { ttl: 120_000 });
  const { hidden } = useBalance();

  async function exportPDF() {
    if (!data) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(`Laporan Keuangan`, 14, 20);
    doc.setFontSize(12); doc.text(`${MONTHS[month-1]} ${year}`, 14, 30);
    doc.setFontSize(10);
    doc.text(`Total Pemasukan: ${formatRupiah(data.totalIncome)}`, 14, 45);
    doc.text(`Total Pengeluaran: ${formatRupiah(data.totalExpense)}`, 14, 53);
    doc.text(`Saldo Bersih: ${formatRupiah(data.balance)}`, 14, 61);
    autoTable(doc, {
      startY: 70,
      head: [['Tanggal','Tipe','Kategori','Catatan','Nominal']],
      body: data.transactions.map(t => [formatDate(t.date), t.type==='income'?'Pemasukan':'Pengeluaran', t.category, t.note, formatRupiah(t.amount)]),
      styles: { fontSize: 9 }, headStyles: { fillColor: [236,72,153] },
    });
    doc.save(`laporan-${month}-${year}.pdf`);
  }

  async function exportExcel() {
    if (!data) return;
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet([
      { '': 'Total Pemasukan', Nominal: data.totalIncome },
      { '': 'Total Pengeluaran', Nominal: data.totalExpense },
      { '': 'Saldo Bersih', Nominal: data.balance },
      {},
      ...data.transactions.map(t => ({ Tanggal: formatDate(t.date), Tipe: t.type==='income'?'Pemasukan':'Pengeluaran', Kategori: t.category, Catatan: t.note, Nominal: t.amount })),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    XLSX.writeFile(wb, `laporan-${month}-${year}.xlsx`);
  }

  const dailyChartData = data?.daily.map(d => ({ day: new Date(d.date).getDate().toString(), income: d.income, expense: d.expense })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-pink-800">Laporan</h1>
          <p className="text-pink-400 text-sm">Analisis keuangan bulanan</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
            {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-100 text-pink-500 text-sm shadow-sm hover:bg-pink-50">
            <Download size={15} /> PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-100 text-emerald-500 text-sm shadow-sm hover:bg-emerald-50">
            <FileSpreadsheet size={15} /> Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
      ) : data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Pemasukan', value: data.totalIncome, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Total Pengeluaran', value: data.totalExpense, color: 'text-pink-600', bg: 'bg-pink-50' },
              { label: 'Saldo Bersih', value: data.balance, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`${card.bg} rounded-2xl p-5 border border-white shadow-sm`}>
                <p className="text-xs text-gray-500 mb-2">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>{hidden ? 'Rp *****' : formatRupiah(card.value)}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
              <h3 className="text-sm font-semibold text-pink-700 mb-4">Pemasukan vs Pengeluaran Harian</h3>
              {dailyChartData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-pink-300 text-sm">Belum ada data</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyChartData}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                    <Bar dataKey="income" fill="#34D399" radius={[4,4,0,0]} name="Pemasukan" />
                    <Bar dataKey="expense" fill="#F9A8D4" radius={[4,4,0,0]} name="Pengeluaran" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
              <h3 className="text-sm font-semibold text-pink-700 mb-4">Pengeluaran per Kategori</h3>
              {data.byCategory.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-pink-300 text-sm">Belum ada pengeluaran</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                      {data.byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-pink-50">
              <h3 className="text-sm font-semibold text-pink-700">Semua Transaksi</h3>
            </div>
            {data.transactions.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart2 size={48} className="mx-auto mb-3 text-pink-200" />
                <p className="text-pink-400 text-sm">Belum ada transaksi bulan ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-pink-50">
                    <tr>{['Tanggal','Tipe','Kategori','Catatan','Nominal'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-pink-600">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((t, i) => (
                      <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'}>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(t.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${t.type==='income'?'bg-emerald-100 text-emerald-600':'bg-pink-100 text-pink-600'}`}>
                            {t.type==='income'?'Pemasukan':'Pengeluaran'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{t.category}</td>
                        <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{t.note||'—'}</td>
                        <td className={`px-4 py-3 font-semibold ${t.type==='income'?'text-emerald-500':'text-pink-500'}`}>
                          {hidden ? 'Rp *****' : `${t.type==='income'?'+':'-'}${formatRupiah(t.amount)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
