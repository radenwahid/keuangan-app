'use client';
import { useState, useEffect } from 'react';
import { Banknote, CreditCard, ArrowRight, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { Transaction, WalletType } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initial?: Transaction; // ada = mode edit
}

const WALLET_OPTIONS: { value: WalletType; label: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: 'Cash', icon: <Banknote size={16} /> },
  { value: 'bank', label: 'Bank / E-Wallet', icon: <CreditCard size={16} /> },
];

export default function TransferForm({ onClose, onSuccess, initial }: Props) {
  const isEdit = !!initial;

  const [from, setFrom] = useState<WalletType>(initial?.walletType ?? 'cash');
  const [to, setTo] = useState<WalletType>(initial?.toWalletType ?? 'bank');
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [note, setNote] = useState(initial?.note ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balances, setBalances] = useState<{ cash: number; bank: number } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  useEffect(() => {
    setBalanceLoading(true);
    fetch('/api/transactions/balance')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setBalances(d); })
      .catch(() => {})
      .finally(() => setBalanceLoading(false));
  }, []);

  // Saat edit, saldo "tersedia" = saldo sekarang + nominal lama (karena nanti akan dikurangi lagi)
  const rawFromBalance = balances ? balances[from] : null;
  const fromBalance = rawFromBalance !== null
    ? (isEdit && initial?.walletType === from ? rawFromBalance + (initial?.amount ?? 0) : rawFromBalance)
    : null;

  const amountNum = Number(amount);
  const isInsufficient = fromBalance !== null && amountNum > 0 && amountNum > fromBalance;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (from === to) { setError('Dompet asal dan tujuan tidak boleh sama'); return; }
    setError('');
    setLoading(true);

    const url = isEdit ? `/api/transactions/${initial!.id}` : '/api/transactions/transfer';
    const method = isEdit ? 'PUT' : 'POST';
    const body = isEdit
      ? { type: 'transfer', amount: amountNum, walletType: from, toWalletType: to, note, date, category: 'Transfer' }
      : { amount: amountNum, fromWallet: from, toWallet: to, note, date };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) onSuccess();
    else { const d = await res.json(); setError(d.error || 'Gagal menyimpan'); }
  }

  function swapWallets() { setFrom(to); setTo(from); setError(''); }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* From → To */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-2 block">Dari → Ke</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            {WALLET_OPTIONS.map(w => (
              <button key={w.value} type="button" onClick={() => { setFrom(w.value); setError(''); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  from === w.value ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-pink-200 text-pink-400 hover:bg-pink-50'
                }`}>
                {w.icon} {w.label}
              </button>
            ))}
          </div>

          <button type="button" onClick={swapWallets}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-500 flex items-center justify-center transition-all">
            <ArrowLeftRight size={15} />
          </button>

          <div className="flex-1 flex flex-col gap-1.5">
            {WALLET_OPTIONS.map(w => (
              <button key={w.value} type="button" onClick={() => { setTo(w.value); setError(''); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  to === w.value ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-pink-200 text-pink-400 hover:bg-pink-50'
                }`}>
                {w.icon} {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview arah + saldo tersedia */}
      <div className="bg-pink-50 rounded-xl px-4 py-3 space-y-1.5">
        <div className="flex items-center justify-center gap-2 text-sm text-pink-600">
          <span className="font-medium">{from === 'cash' ? 'Cash' : 'Bank/E-Wallet'}</span>
          <ArrowRight size={14} className="text-pink-400" />
          <span className="font-medium">{to === 'cash' ? 'Cash' : 'Bank/E-Wallet'}</span>
        </div>
        {balanceLoading ? (
          <p className="text-xs text-center text-gray-400 animate-pulse">Memuat saldo...</p>
        ) : fromBalance !== null ? (
          <p className={`text-xs text-center font-medium ${isInsufficient ? 'text-red-500' : 'text-gray-400'}`}>
            Saldo {from === 'cash' ? 'Cash' : 'Bank/E-Wallet'} tersedia: {formatRupiah(fromBalance)}
          </p>
        ) : (
          <p className="text-xs text-center text-gray-400">Saldo tidak tersedia</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-medium text-pink-600 mb-1 block">Nominal</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400 text-sm">Rp</span>
          <input type="number" value={amount} onChange={e => { setAmount(e.target.value); setError(''); }} required min="1"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors ${
              isInsufficient ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-pink-200 focus:ring-pink-300'
            }`}
            placeholder="0" />
        </div>
        {isInsufficient && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
            <AlertCircle size={13} />
            <span>Saldo tidak mencukupi. Kurang {formatRupiah(amountNum - fromBalance!)}</span>
          </div>
        )}
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

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-full border border-pink-200 text-pink-500 text-sm font-medium hover:bg-pink-50">
          Batal
        </button>
        <button type="submit" disabled={loading || from === to || isInsufficient}
          className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium shadow-md shadow-violet-200 disabled:opacity-60">
          {loading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Transfer'}
        </button>
      </div>
    </form>
  );
}
