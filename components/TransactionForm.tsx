'use client';
import { useState } from 'react';
import { Category, Template, Transaction, WalletType } from '@/lib/types';
import { formatRupiah, formatThousands, parseThousands } from '@/lib/utils';
import { Banknote, CreditCard } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface Props {
  onSubmit: (data: Partial<Transaction>) => Promise<void>;
  onClose: () => void;
  initial?: Partial<Transaction>;
  categories: Category[];
  templates?: Template[];
}

export default function TransactionForm({ onSubmit, onClose, initial, categories, templates = [] }: Props) {
  const { t } = useI18n();
  const [type, setType] = useState<'income' | 'expense'>(
    (initial?.type === 'income' || initial?.type === 'expense') ? initial.type : 'expense'
  );
  const [walletType, setWalletType] = useState<WalletType>(initial?.walletType || 'cash');
  const [amount, setAmount] = useState(initial?.amount ? formatThousands(initial.amount.toString()) : '');
  const [category, setCategory] = useState(initial?.category || '');
  const [note, setNote] = useState(initial?.note || '');
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredCats = categories.filter((c) => c.type === type);

  function applyTemplate(t: Template) {
    setType(t.type);
    setAmount(formatThousands(t.amount.toString()));
    setCategory(t.category);
    setNote(t.note);
    setShowTemplates(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ type, walletType, amount: parseThousands(amount), category, note, date });
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {templates.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowTemplates(!showTemplates)}
            className="text-sm text-pink-500 underline">
            {showTemplates ? t('form_close_template') : t('form_load_template')}
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
          {t('form_expense')}
        </button>
        <button type="button" onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2.5 text-sm font-medium transition-all ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-pink-400 hover:bg-pink-50'}`}>
          {t('form_income')}
        </button>
      </div>

      {/* Wallet type */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1.5 block">
          {type === 'income' ? t('form_receive_to') : t('form_pay_from')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setWalletType('cash')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              walletType === 'cash'
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : 'border-pink-200 text-pink-400 hover:bg-pink-50'
            }`}>
            <Banknote size={16} />
            {t('tx_wallet_cash')}
          </button>
          <button type="button" onClick={() => setWalletType('bank')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              walletType === 'bank'
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-pink-200 text-pink-400 hover:bg-pink-50'
            }`}>
            <CreditCard size={16} />
            {t('tx_wallet_bank')}
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('form_amount')}</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 text-sm">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={amount}
            onChange={e => setAmount(formatThousands(e.target.value))}
            required
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            placeholder="0"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('form_category')}</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} required
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white">
          <option value="">{t('form_pick_category')}</option>
          {filteredCats.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('form_note')}</label>
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          placeholder={t('form_optional')} />
      </div>

      {/* Date */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">{t('form_date')}</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50">
          {t('form_cancel')}
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-medium shadow-md shadow-pink-200 disabled:opacity-60">
          {loading ? t('form_saving') : t('form_save')}
        </button>
      </div>
    </form>
  );
}
