'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Tag, Lock } from 'lucide-react';
import { Category } from '@/lib/types';
import Modal from '@/components/Modal';
import CategoryIcon, { ICON_OPTIONS } from '@/components/CategoryIcon';
import { useToast } from '@/components/Toast';
import { SkeletonList } from '@/components/Skeleton';

const COLOR_OPTIONS = ['#EC4899','#F97316','#EF4444','#10B981','#3B82F6','#8B5CF6','#F59E0B','#14B8A6','#64748B','#A855F7'];

function CategoryForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Category>;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [type, setType] = useState<'income' | 'expense'>(initial?.type || 'expense');
  const [color, setColor] = useState(initial?.color || '#EC4899');
  const [icon, setIcon] = useState(initial?.icon || 'Tag');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ name, type, color, icon });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Nama Kategori</label>
        <input value={name} onChange={e => setName(e.target.value)} required
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Tipe</label>
        <div className="flex rounded-xl overflow-hidden border border-pink-200">
          <button type="button" onClick={() => setType('expense')}
            className={`flex-1 py-2.5 text-sm font-medium ${type === 'expense' ? 'bg-pink-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
            Pengeluaran
          </button>
          <button type="button" onClick={() => setType('income')}
            className={`flex-1 py-2.5 text-sm font-medium ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
            Pemasukan
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-pink-600 mb-2 block">Warna</label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-pink-600 mb-2 block">Ikon</label>
        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
          {ICON_OPTIONS.map(ic => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              className={`p-2 rounded-xl flex items-center justify-center transition-all ${icon === ic ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-400 hover:bg-pink-100'}`}>
              <CategoryIcon icon={ic} size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm">Batal</button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm disabled:opacity-60">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleAdd(data: Partial<Category>) {
    const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast('Kategori ditambahkan'); setShowModal(false); fetchCategories(); }
    else { const e = await res.json(); showToast(e.error || 'Gagal', 'error'); }
  }

  async function handleEdit(data: Partial<Category>) {
    if (!editCat) return;
    const res = await fetch(`/api/categories/${editCat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (res.ok) { showToast('Kategori diperbarui'); setEditCat(null); fetchCategories(); }
    else showToast('Gagal memperbarui', 'error');
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Kategori dihapus'); fetchCategories(); }
    else { const e = await res.json(); showToast(e.error || 'Gagal menghapus', 'error'); }
  }

  const filtered = categories.filter(c => c.type === tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-800">Kategori</h1>
          <p className="text-pink-400 text-sm">{categories.length} kategori</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm shadow-md shadow-pink-200">
          <Plus size={16} /> Tambah
        </button>
      </div>

      <div className="flex rounded-2xl overflow-hidden border border-pink-200 bg-white w-fit">
        <button onClick={() => setTab('expense')} className={`px-5 py-2.5 text-sm font-medium transition-all ${tab === 'expense' ? 'bg-pink-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
          Pengeluaran
        </button>
        <button onClick={() => setTab('income')} className={`px-5 py-2.5 text-sm font-medium transition-all ${tab === 'income' ? 'bg-emerald-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
          Pemasukan
        </button>
      </div>

      {loading ? <SkeletonList /> : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-pink-100">
          <Tag size={48} className="mx-auto mb-3 text-pink-200" />
          <p className="text-pink-400 text-sm">Belum ada kategori</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-pink-100 shadow-sm flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: cat.color + '20' }}>
                <CategoryIcon icon={cat.icon} size={20} style={{ color: cat.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700">{cat.name}</p>
                {cat.isDefault && (
                  <span className="text-xs text-pink-400 flex items-center gap-1"><Lock size={10} /> Default</span>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditCat(cat)} className="p-2 rounded-lg hover:bg-pink-50 text-pink-400"><Pencil size={15} /></button>
                {!cat.isDefault && (
                  <button onClick={() => handleDelete(cat)} className="p-2 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={15} /></button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Tambah Kategori">
        <CategoryForm onSubmit={handleAdd} onClose={() => setShowModal(false)} />
      </Modal>
      <Modal open={!!editCat} onClose={() => setEditCat(null)} title="Edit Kategori">
        {editCat && <CategoryForm initial={editCat} onSubmit={handleEdit} onClose={() => setEditCat(null)} />}
      </Modal>
    </div>
  );
}
