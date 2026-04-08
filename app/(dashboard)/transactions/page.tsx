'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  Download, FileSpreadsheet, CreditCard, Banknote, Eye,
  CheckSquare, Square, X, ArrowLeftRight,
} from 'lucide-react';
import { Transaction, Category, Template } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';
import TransactionForm from '@/components/TransactionForm';
import TransferForm from '@/components/TransferForm';
import TransactionReceipt from '@/components/TransactionReceipt';
import CategoryIcon from '@/components/CategoryIcon';
import { SkeletonList } from '@/components/Skeleton';
import { useToast } from '@/components/Toast';
import { useFetch } from '@/lib/useFetch';
import { cacheInvalidate } from '@/lib/cache';
import { useBalance } from '@/components/DashboardShell';
import { useI18n, useMonths } from '@/lib/i18n';

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const now = new Date();
  const { t } = useI18n();
  const MONTHS = useMonths();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [editTransfer, setEditTransfer] = useState<Transaction | null>(null);
  const [viewTx, setViewTx] = useState<Transaction | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterWallet, setFilterWallet] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const { showToast } = useToast();
  const { hidden } = useBalance();

  const params = new URLSearchParams({ month: String(month), year: String(year) });
  if (filterType) params.set('type', filterType);
  if (filterCat) params.set('category', filterCat);
  const txUrl = `/api/transactions?${params}`;

  const { data: rawTxs, loading: txLoading, refresh: refreshTx } = useFetch<Transaction[]>(txUrl, { ttl: 60_000 });
  const { data: categories, loading: catLoading } = useFetch<Category[]>('/api/categories', { ttl: 300_000 });
  const { data: templates } = useFetch<Template[]>('/api/templates', { ttl: 300_000 });

  const loading = txLoading || catLoading;
  const cats = categories ?? [];
  const tpls = templates ?? [];

  // client-side wallet filter (not a query param)
  const transactions = filterWallet
    ? (rawTxs ?? []).filter(t => t.walletType === filterWallet)
    : (rawTxs ?? []);

  function prevMonth() { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }

  /** Invalidate transactions cache (all months) then re-fetch current view */
  const invalidateAndRefresh = useCallback(() => {
    cacheInvalidate(txUrl);
    refreshTx(txUrl);
  }, [txUrl, refreshTx]);

  async function handleAdd(data: Partial<Transaction>) {
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast(t('tx_added')); setShowModal(false); invalidateAndRefresh(); }
    else showToast(t('tx_add_fail'), 'error');
  }

  async function handleEdit(data: Partial<Transaction>) {
    if (!editTx) return;
    const res = await fetch(`/api/transactions/${editTx.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast(t('tx_updated')); setEditTx(null); invalidateAndRefresh(); }
    else showToast(t('tx_update_fail'), 'error');
  }

  async function handleDelete(id: string) {
    if (!confirm(t('tx_delete_confirm'))) return;
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast(t('tx_deleted')); invalidateAndRefresh(); }
    else showToast(t('tx_delete_fail'), 'error');
  }

  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    if (paginated.every(t => selected.has(t.id))) {
      setSelected(prev => { const n = new Set(prev); paginated.forEach(t => n.delete(t.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); paginated.forEach(t => n.add(t.id)); return n; });
    }
  }
  function exitBulk() { setBulkMode(false); setSelected(new Set()); }

  const selectedTxs = transactions.filter(t => selected.has(t.id));
  const allPageSelected = paginated.length > 0 && paginated.every(t => selected.has(t.id));

  function getExportData(source: Transaction[]) {
    return source.map(t => ({
      Tanggal: formatDate(t.date),
      Tipe: t.type === 'income' ? 'Pemasukan' : t.type === 'transfer' ? 'Transfer' : 'Pengeluaran',
      Kategori: t.type === 'transfer'
        ? `${t.walletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'} → ${t.toWalletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'}`
        : t.category,
      Dompet: t.type === 'transfer'
        ? `${t.walletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'} → ${t.toWalletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'}`
        : t.walletType === 'bank' ? 'Bank/E-Wallet' : 'Cash',
      Catatan: t.note,
      Nominal: t.amount,
    }));
  }

  async function exportPDF(source: Transaction[], label: string) {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Transaksi - ${label}`, 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Dompet', 'Catatan', 'Nominal']],
      body: source.map(t => [
        formatDate(t.date),
        t.type === 'income' ? 'Pemasukan' : t.type === 'transfer' ? 'Transfer' : 'Pengeluaran',
        t.type === 'transfer'
          ? `${t.walletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'} → ${t.toWalletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'}`
          : t.category,
        t.type === 'transfer'
          ? `${t.walletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'} → ${t.toWalletType === 'cash' ? 'Cash' : 'Bank/E-Wallet'}`
          : t.walletType === 'bank' ? 'Bank/E-Wallet' : 'Cash',
        t.note,
        formatRupiah(t.amount),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [236, 72, 153] },
    });
    doc.save(`transaksi-${label.replace(/\s/g, '-')}.pdf`);
  }

  async function exportExcel(source: Transaction[], label: string) {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(getExportData(source));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaksi');
    XLSX.writeFile(wb, `transaksi-${label.replace(/\s/g, '-')}.xlsx`);
  }

  const monthLabel = `${MONTHS[month - 1]}-${year}`;
  function getCategoryColor(name: string) { return cats.find(c => c.name === name)?.color || '#EC4899'; }
  function getCategoryIcon(name: string) { return cats.find(c => c.name === name)?.icon || 'Tag'; }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-pink-800">{t('tx_title')}</h1>
          <p className="text-pink-400 text-sm">{transactions.length} transaksi</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white rounded-2xl border border-pink-100 px-3 py-2 shadow-sm">
            <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-pink-50 text-pink-400"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium text-pink-700 min-w-[110px] text-center">{MONTHS[month-1]} {year}</span>
            <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-pink-50 text-pink-400"><ChevronRight size={16} /></button>
          </div>
          <button onClick={() => exportPDF(transactions, monthLabel)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-100 text-pink-500 text-sm shadow-sm hover:bg-pink-50">
            <Download size={15} /> PDF
          </button>
          <button onClick={() => exportExcel(transactions, monthLabel)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-pink-100 text-emerald-500 text-sm shadow-sm hover:bg-emerald-50">
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button onClick={() => { setBulkMode(b => !b); setSelected(new Set()); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm shadow-sm transition-all ${bulkMode ? 'bg-violet-500 border-violet-500 text-white' : 'bg-white border-pink-100 text-violet-500 hover:bg-violet-50'}`}>
            <CheckSquare size={15} /> {t('tx_select')}
          </button>
          <button onClick={() => setShowTransfer(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm shadow-md shadow-violet-200">
            <ArrowLeftRight size={16} /> {t('tx_transfer')}
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm shadow-md shadow-pink-200">
            <Plus size={16} /> {t('tx_add')}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
          <option value="">{t('tx_filter_all_type')}</option>
          <option value="income">{t('tx_filter_income')}</option>
          <option value="expense">{t('tx_filter_expense')}</option>
          <option value="transfer">{t('tx_filter_transfer')}</option>
        </select>
        <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
          <option value="">{t('tx_filter_all_cat')}</option>
          {cats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={filterWallet} onChange={e => { setFilterWallet(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border border-pink-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300">
          <option value="">{t('tx_filter_all_wallet')}</option>
          <option value="cash">{t('tx_wallet_cash')}</option>
          <option value="bank">{t('tx_wallet_bank')}</option>
        </select>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {bulkMode && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
            <button onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-sm text-violet-600 font-medium hover:text-violet-800">
              {allPageSelected ? <CheckSquare size={16} /> : <Square size={16} />}
              {allPageSelected ? t('tx_deselect_all') : t('tx_select_page')}
            </button>
            <span className="text-xs text-violet-400">|</span>
            <button onClick={() => setSelected(new Set(transactions.filter(tx => tx.type === 'income').map(tx => tx.id)))}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium">
              {t('tx_all_income')}
            </button>
            <button onClick={() => setSelected(new Set(transactions.filter(tx => tx.type === 'expense').map(tx => tx.id)))}
              className="text-xs px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 font-medium">
              {t('tx_all_expense')}
            </button>
            <div className="flex-1" />
            {selected.size > 0 && (
              <>
                <span className="text-xs text-violet-500 font-medium">{selected.size} {t('tx_selected')}</span>
                <button onClick={() => exportPDF(selectedTxs, `pilihan-${monthLabel}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-medium hover:bg-pink-600">
                  <Download size={13} /> PDF
                </button>
                <button onClick={() => exportExcel(selectedTxs, `pilihan-${monthLabel}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600">
                  <FileSpreadsheet size={13} /> Excel
                </button>
              </>
            )}
            <button onClick={exitBulk} className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-400"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? <SkeletonList /> : paginated.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-pink-100">
          <CreditCard size={48} className="mx-auto mb-3 text-pink-200" />
          <p className="text-pink-400 text-sm">{t('tx_empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((tx, i) => {
            const isSelected = selected.has(tx.id);
            return (
              <motion.div key={tx.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3 transition-all ${isSelected ? 'border-violet-300 bg-violet-50' : 'border-pink-100'} ${bulkMode ? 'cursor-pointer' : 'cursor-pointer sm:cursor-default'}`}
                onClick={() => bulkMode ? toggleSelect(tx.id) : setViewTx(tx)}>
                {bulkMode && (
                  <div className="flex-shrink-0 text-violet-500" onClick={e => { e.stopPropagation(); toggleSelect(tx.id); }}>
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
                  </div>
                )}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'transfer' ? 'bg-violet-100' : ''}`}
                  style={tx.type !== 'transfer' ? { backgroundColor: getCategoryColor(tx.category) + '20' } : {}}>
                  {tx.type === 'transfer'
                    ? <ArrowLeftRight size={18} className="text-violet-500" />
                    : <CategoryIcon icon={getCategoryIcon(tx.category)} size={18} style={{ color: getCategoryColor(tx.category) }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-700">
                      {tx.type === 'transfer'
                        ? `${tx.walletType === 'cash' ? t('tx_wallet_cash') : t('tx_wallet_bank')} → ${tx.toWalletType === 'cash' ? t('tx_wallet_cash') : t('tx_wallet_bank')}`
                        : tx.category}
                    </p>
                    <span className={`hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full ${
                      tx.type === 'income' ? 'bg-emerald-100 text-emerald-600'
                      : tx.type === 'transfer' ? 'bg-violet-100 text-violet-600'
                      : 'bg-pink-100 text-pink-600'}`}>
                      {tx.type === 'income' ? t('common_income') : tx.type === 'transfer' ? t('common_transfer') : t('common_expense')}
                    </span>
                    {tx.type !== 'transfer' && (
                      <span className={`hidden sm:inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${tx.walletType === 'bank' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {tx.walletType === 'bank' ? <CreditCard size={10} /> : <Banknote size={10} />}
                        {tx.walletType === 'bank' ? t('common_bank') : t('common_cash')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{tx.note || '—'} · {formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'transfer' ? 'text-violet-500' : 'text-pink-500'}`}>
                  {hidden ? 'Rp *****' : `${tx.type === 'income' ? '+' : tx.type === 'transfer' ? '⇄ ' : '-'}${formatRupiah(tx.amount)}`}
                </span>
                {!bulkMode && (
                  <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button onClick={() => setViewTx(tx)} className="hidden sm:flex p-2 rounded-lg hover:bg-violet-50 text-violet-400"><Eye size={15} /></button>
                    <button onClick={() => tx.type === 'transfer' ? setEditTransfer(tx) : setEditTx(tx)} className="p-2 rounded-lg hover:bg-pink-50 text-pink-400"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(tx.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={15} /></button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-pink-200 text-pink-500 text-sm disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="text-sm text-pink-600">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-pink-200 text-pink-500 text-sm disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t('tx_modal_add')}>
        <TransactionForm onSubmit={handleAdd} onClose={() => setShowModal(false)} categories={cats} templates={tpls} />
      </Modal>
      <Modal open={!!editTx} onClose={() => setEditTx(null)} title={t('tx_modal_edit')}>
        {editTx && <TransactionForm onSubmit={handleEdit} onClose={() => setEditTx(null)} initial={editTx} categories={cats} />}
      </Modal>
      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title={t('tx_modal_transfer')}>
        <TransferForm
          onClose={() => setShowTransfer(false)}
          onSuccess={() => { setShowTransfer(false); showToast(t('tx_added')); invalidateAndRefresh(); }}
        />
      </Modal>
      <Modal open={!!editTransfer} onClose={() => setEditTransfer(null)} title={t('tx_modal_edit_transfer')}>
        {editTransfer && (
          <TransferForm
            initial={editTransfer}
            onClose={() => setEditTransfer(null)}
            onSuccess={() => { setEditTransfer(null); showToast(t('tx_updated')); invalidateAndRefresh(); }}
          />
        )}
      </Modal>
      <TransactionReceipt transaction={viewTx} categories={cats} onClose={() => setViewTx(null)} />
    </div>
  );
}
