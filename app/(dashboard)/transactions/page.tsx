'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Download, FileSpreadsheet, CreditCard } from 'lucide-react';
import { Transaction, Category, Template } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';
import CategoryIcon from '@/components/CategoryIcon';
import { SkeletonList } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ month: String(month), year: String(year) });
    if (filterType) params.set('type', filterType);
    if (filterCat) params.set('category', filterCat);
    const [txRes, catRes, tplRes] = await Promise.all([
      fetch(`/api/transactions?${params}`),
      fetch('/api/categories'),
      fetch('/api/templates'),
    ]);
    setTransactions(await txRes.json());
    setCategories(await catRes.json());
    setTemplates(await tplRes.json());
    setLoading(false);
    setPage(1);
  }, [month, year, filterType, filterCat]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function prevMonth() { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }

  async function handleAdd(data: Partial<Transaction>) {
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast('Transaksi ditambahkan'); setShowModal(false); fetchData(); }
    else showToast('Gagal menambahkan', 'error');
  }

  async function handleEdit(data: Partial<Transaction>) {
    if (!editTx) return;
    const res = await fetch(`/api/transactions/${editTx.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast('Transaksi diperbarui'); setEditTx(null); fetchData(); }
    else showToast('Gagal memperbarui', 'error');
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus transaksi ini?')) return;
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Transaksi dihapus'); fetchData(); }
    else showToast('Gagal menghapus', 'error');
  }

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Transaksi - ${MONTHS[month-1]} ${year}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Nominal']],
      body: transactions.map(t => [formatDate(t.date), t.type === 'income' ? 'Pemasukan' : 'Pengeluaran', t.category, t.note, formatRupiah(t.amount)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [236, 72, 153] },
    });
    doc.save(`transaksi-${month}-${year}.pdf`);
  }

  async function exportExcel() {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(transactions.map(t => ({
      Tanggal: formatDate(t.date), Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: t.category, Catatan: t.note, Nominal: t.amount,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    XLSX.writeFile(wb, `transaksi-${month}-${year}.xlsx`);
  }

  function getCategoryColor(name: string) { return categories.find(c => c.name === name)?.color || '#EC4899'; }
  function getCategoryIcon(name: string) { return categories.find(c => c.name === name)?.icon || 'Tag'; }

  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-pink-800">Transaksi</h1>
          <p className="text-pink-400 text-sm">{transactions.length} transaksi</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white rounded-2xl border border-pink-100 px-3 py-2 shadow-sm">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-pink-50 text-pink-400"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-pink-700 min-w-[110px] text-center">{MONTHS[month-1]} {year}</span>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-pink-50 text-pink-400"><ChevronRight size={16} /></button>
          </div>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-100 text-pink-500 text-sm shadow-sm hover:bg-pink-50">
            <Download size={15} /> PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-100 text-emerald-500 text-sm shadow-sm hover:bg-emerald-50">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm shadow-md shadow-pink-200">
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
          <option value="">Semua Kategori</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? <SkeletonList /> : paginated.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-pink-100">
          <CreditCard size={48} className="mx-auto mb-3 text-pink-200" />
          <p className="text-pink-400 text-sm">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: getCategoryColor(t.category) + '20' }}>
                <CategoryIcon icon={getCategoryIcon(t.category)} size={18} style={{ color: getCategoryColor(t.category) }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-700">{t.category}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-pink-100 text-pink-600'}`}>
                    {t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{t.note || '—'} · {formatDate(t.date)}</p>
              </div>
              <span className={`text-sm font-bold flex-shrink-0 ${t.type === 'income' ? 'text-emerald-500' : 'text-pink-500'}`}>
                {t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}
              </span>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditTx(t)} className="p-2 rounded-lg hover:bg-pink-50 text-pink-400"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-pink-200 text-pink-500 text-sm disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-pink-600">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-pink-200 text-pink-500 text-sm disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tambah Transaksi">
        <TransactionForm onSubmit={handleAdd} onClose={() => setShowModal(false)} categories={categories} templates={templates} />
      </Modal>
      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Edit Transaksi">
        {editTx && <TransactionForm onSubmit={handleEdit} onClose={() => setEditTx(null)} initial={editTx} categories={categories} />}
      </Modal>
    </div>
  );
}
