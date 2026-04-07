'use client';
import { useState } from 'react';
import { Banknote, CreditCard, ArrowRight } from 'lucide-react';
import { WalletType } from '@/lib/types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const WALLET_OPTIONS: { value: WalletType; label: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: 'Cash', icon: <Banknote size={16} /> },
  { value: 'bank', label: 'Bank / E-Wallet', icon: <CreditCard size={16} /> },
];

export default function TransferForm({ onClose, onSuccess }: Props) {
  const [from, setFrom] = useState<WalletType>('cash');
  const [to, setTo] = useState<WalletType>('bank');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (from === to) { setError('Dompet asal dan tujuan tidak boleh sama'); return; }
    setError('');
    setLoading(true);
    const res = await fetch('/api/transactions/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), fromWallet: from, toWallet: to, note, date }),
    });
    setLoading(false);
    if (res.ok) onSuccess();
    else { const d = await res.json(); setError(d.error || 'Gagal menyimpan'); }
  }

  function swapWallets() {
    setFrom(to);
    setTo(from);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* From → To */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-2 block">Dari → Ke</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            {WALLET_OPTIONS.map(w => (
              <button key={w.value} type="button" onClick={() => setFrom(w.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  from === w.value
                    ? 'border-amber-400 bg-amber-50 text-amber-700'
                    : 'border-pink-200 text-pink-400 hover:bg-pink-50'
                }`}>
                {w.icon} {w.label}
              </button>
            ))}
          </div>

          {/* Swap button */}
          <button type="button" onClick={swapWallets}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-500 flex items-center justify-center transition-all">
            <ArrowRight size={16} />
          </button>

          <div className="flex-1 flex flex-col gap-1.5">
            {WALLET_OPTIONS.map(w => (
              <button key={w.value} type="button" onClick={() => setTo(w.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  to === w.value
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-pink-200 text-pink-400 hover:bg-pink-50'
                }`}>
                {w.icon} {w.label}
              </button>
            ))}
          </div>
        </div>
        {from === to && (
          <p className="text-xs text-red-400 mt-1">Dompet asal dan tujuan tidak boleh sama</p>
        )}
      </div>

      {/* Preview arah transfer */}
      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-pink-50 rounded-xl text-sm text-pink-600">
        <span className="font-medium">{from === 'cash' ? 'Cash' : 'Bank/E-Wallet'}</span>
        <ArrowRight size={14} className="text-pink-400" />
        <span className="font-medium">{to === 'cash' ? 'Cash' : 'Bank/E-Wallet'}</span>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Nominal</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 text-sm">Rp</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            placeholder="0" />
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Catatan</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          placeholder="Opsional" />
      </div>

      {/* Date */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Tanggal</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required
          className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm" />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50">
          Batal
        </button>
        <button type="submit" disabled={loading || from === to}
          className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white text-sm font-medium shadow-md shadow-pink-200 disabled:opacity-60">
          {loading ? 'Menyimpan...' : 'Transfer'}
        </button>
      </div>
    </form>
  );
}
