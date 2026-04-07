import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Transaction, Notification } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { amount, fromWallet, toWallet, note, date } = body;

    if (!amount || !fromWallet || !toWallet || !date) {
      return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 });
    }
    if (fromWallet === toWallet) {
      return NextResponse.json({ error: 'Dompet asal dan tujuan tidak boleh sama' }, { status: 400 });
    }

    const txs = await readJSONAsync<Transaction>('transactions.json');
    const userTxs = txs.filter(t => t.userId === user.userId);

    // Hitung saldo dompet asal
    const walletBalance = userTxs.reduce((bal, t) => {
      if (t.type === 'income' && t.walletType === fromWallet) return bal + t.amount;
      if (t.type === 'expense' && t.walletType === fromWallet) return bal - t.amount;
      // transfer keluar dari wallet ini
      if (t.type === 'transfer' && t.walletType === fromWallet) return bal - t.amount;
      // transfer masuk ke wallet ini
      if (t.type === 'transfer' && t.toWalletType === fromWallet) return bal + t.amount;
      return bal;
    }, 0);

    if (walletBalance < Number(amount)) {
      const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
      const fromLabel = fromWallet === 'cash' ? 'Cash' : 'Bank/E-Wallet';
      return NextResponse.json({
        error: `Saldo ${fromLabel} tidak mencukupi. Saldo tersedia: ${fmt.format(walletBalance)}, dibutuhkan: ${fmt.format(Number(amount))}.`,
        code: 'INSUFFICIENT_BALANCE',
        available: walletBalance,
      }, { status: 422 });
    }

    const newTx: Transaction = {
      id: generateId(),
      userId: user.userId,
      type: 'transfer',
      amount: Number(amount),
      category: 'Transfer',
      note: note || '',
      date,
      walletType: fromWallet,
      toWalletType: toWallet,
      createdAt: new Date().toISOString(),
    };
    txs.push(newTx);
    await writeJSONAsync('transactions.json', txs);

    // Notifikasi
    const notifs = await readJSONAsync<Notification>('notifications.json');
    const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
    const fromLabel = fromWallet === 'cash' ? 'Cash' : 'Bank/E-Wallet';
    const toLabel = toWallet === 'cash' ? 'Cash' : 'Bank/E-Wallet';
    notifs.push({
      id: generateId(),
      userId: user.userId,
      title: 'Transfer dicatat',
      message: `${fmt} dari ${fromLabel} → ${toLabel}${note ? ` · ${note}` : ''}`,
      type: 'transaction',
      read: false,
      createdAt: new Date().toISOString(),
      transactionId: newTx.id,
    });
    await writeJSONAsync('notifications.json', notifs);

    return NextResponse.json(newTx, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
