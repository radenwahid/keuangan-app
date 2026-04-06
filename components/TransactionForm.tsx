'use client';
import { useState, useEffect } from 'react';
import { Category, Template, Transaction } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import CategoryIcon from './CategoryIcon';

interface Props {
  onSubmit: (data: Partial<Transaction>) => Promise<void>;
  onClose: () => void;
  initial?: Partial<Transaction>;
  categories: Category[];
  templates?: Template[];
}

export default function TransactionForm({ onSubmit, onClose, initial, categories, templates = [] }: Props) {
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [note, setNote] = useState(initial?.note || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredCats = categories.filter((c) => c.type === type);

  function applyTemplate(t: Template) {
    setType(t.type);
    setAmount(t.amount.toString());
    setCategory(t.category);
    setNote(t.note);
    setShowTemplates(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ type, amount: Number(amount), category, note, date });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {templates.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowTemplates(!showTemplates)}
            className="text-sm text-pink-500 underline">
            {showTemplates ? 'Tutup Template' : 'Muat dari Template'}
          </button>
          {showTemplates && (
            <div className="mt-2 border border-pink-100 rounded-xl overflow-hidden">
              {templates.map((t) => (
                <button key={t.id} type="button" onClick={() => applyTemplate(t)}
                  className="w-full text-left px-4 py-2.5 hover:bg-pink-50 text-sm border-b border-pink-50 last:border-0">
                  <span className="font-medium text-pink-700">{t.name}</span>
                  <span className="text-pink-400 ml-2">{formatRupiah(t.amount)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-pink-200">
        <button type="button" onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2.5 text-sm font-medium transition-all ${type === 'expense' ? 'bg-pink-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
          Pengeluaran
        </button>
        <button type="button" onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2.5 text-sm font-medium transition-all ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
          Pemasukan
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Nominal</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 text-sm">Rp</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            placeholder="0" />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Kategori</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white">
          <option value="">Pilih kategori</option>
          {filteredCats.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Catatan</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          placeholder="Opsional" />
      </div>

      {/* Date */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Tanggal</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50">
          Batal
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-medium shadow-md shadow-pink-200 disabled:opacity-60">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
