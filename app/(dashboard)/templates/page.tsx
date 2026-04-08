'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';
import { Template, Category } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { SkeletonList } from '@/components/Skeleton';
import { useFetch } from '@/lib/useFetch';
import { useI18n } from '@/lib/i18n';

function TemplateForm({ initial, categories, onSubmit, onClose }: {
  initial?: Partial<Template>;
  categories: Category[];
  onSubmit: (data: Partial<Template>) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [category, setCategory] = useState(initial?.category || '');
  const [note, setNote] = useState(initial?.note || '');
  const [loading, setLoading] = useState(false);

  const filteredCats = categories.filter(c => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ name, type, amount: Number(amount), category, note });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('tpl_name')}</label>
        <input value={name} onChange={e => setName(e.target.value)} required
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          placeholder="Contoh: Bayar Kos" />
      </div>
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('tpl_type')}</label>
        <div className="flex rounded-xl overflow-hidden border border-pink-200">
          <button type="button" onClick={() => { setType('expense'); setCategory(''); }}
            className={`flex-1 py-2.5 text-sm font-medium ${type === 'expense' ? 'bg-pink-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
            {t('form_expense')}
          </button>
          <button type="button" onClick={() => { setType('income'); setCategory(''); }}
            className={`flex-1 py-2.5 text-sm font-medium ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
            {t('form_income')}
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('tpl_amount')}</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 text-sm">Rp</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            placeholder="0" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('tpl_category')}</label>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white">
          <option value="">{t('form_pick_category')}</option>
          {filteredCats.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('tpl_note')}</label>
        <input value={note} onChange={e => setNote(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          placeholder={t('form_optional')} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm">{t('form_cancel')}</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm disabled:opacity-60">
          {loading ? t('form_saving') : t('form_save')}
        </button>
      </div>
    </form>
  );
}

export default function TemplatesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editTpl, setEditTpl] = useState<Template | null>(null);
  const { t } = useI18n();
  const { showToast } = useToast();

  const { data: tplData, loading, refresh: refreshTpl } = useFetch<Template[]>('/api/templates', { ttl: 300_000 });
  const { data: catData } = useFetch<Category[]>('/api/categories', { ttl: 300_000 });
  const templates = tplData ?? [];
  const categories = catData ?? [];

  async function handleAdd(data: Partial<Template>) {
    const res = await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast(t('tpl_added')); setShowModal(false); refreshTpl(); }
    else showToast(t('tpl_add_fail'), 'error');
  }

  async function handleEdit(data: Partial<Template>) {
    if (!editTpl) return;
    const res = await fetch(`/api/templates/${editTpl.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast(t('tpl_updated')); setEditTpl(null); refreshTpl(); }
    else showToast(t('tpl_update_fail'), 'error');
  }

  async function handleDelete(id: string) {
    if (!confirm(t('tpl_delete_confirm'))) return;
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast(t('tpl_deleted')); refreshTpl(); }
    else showToast(t('tpl_delete_fail'), 'error');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-800">{t('tpl_title')}</h1>
          <p className="text-pink-400 text-sm">{templates.length} template tersimpan</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm shadow-md shadow-pink-200">
          <Plus size={16} /> {t('tpl_add')}
        </button>
      </div>

      {loading ? <SkeletonList /> : templates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-pink-100">
          <FileText size={48} className="mx-auto mb-3 text-pink-200" />
          <p className="text-pink-400 text-sm">{t('tpl_empty')}</p>
          <p className="text-pink-300 text-xs mt-1">{t('tpl_empty_sub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl, i) => (
            <motion.div key={tpl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-700">{tpl.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${tpl.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-pink-100 text-pink-600'}`}>
                    {tpl.type === 'income' ? t('common_income') : t('common_expense')}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditTpl(tpl)} className="p-1.5 rounded-lg hover:bg-pink-50 text-pink-400"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(tpl.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className={`text-lg font-bold ${tpl.type === 'income' ? 'text-emerald-500' : 'text-pink-500'}`}>{formatRupiah(tpl.amount)}</p>
              {tpl.category && <p className="text-xs text-gray-400 mt-1">{tpl.category}</p>}
              {tpl.note && <p className="text-xs text-gray-400 truncate">{tpl.note}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t('tpl_modal_add')}>
        <TemplateForm categories={categories} onSubmit={handleAdd} onClose={() => setShowModal(false)} />
      </Modal>
      <Modal open={!!editTpl} onClose={() => setEditTpl(null)} title={t('tpl_modal_edit')}>
        {editTpl && <TemplateForm initial={editTpl} categories={categories} onSubmit={handleEdit} onClose={() => setEditTpl(null)} />}
      </Modal>
    </div>
  );
}
