import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { Transaction } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const txs = await readJSONAsync<Transaction>('transactions.json');
    const idx = txs.findIndex((t) => t.id === id && t.userId === user.userId);
    if (idx === -1) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

    const existing = txs[idx];

    // Validasi saldo untuk edit transfer
    if (body.type === 'transfer' || existing.type === 'transfer') {
      const fromWallet = body.walletType ?? existing.walletType;
      const newAmount = Number(body.amount ?? existing.amount);
      const userTxs = txs.filter(t => t.userId === user.userId);

      // Hitung saldo wallet asal, kecualikan transaksi yang sedang diedit
      const walletBalance = userTxs
        .filter(t => t.id !== id)
        .reduce((bal, t) => {
          if (t.type === 'income' && t.walletType === fromWallet) return bal + t.amount;
          if (t.type === 'expense' && t.walletType === fromWallet) return bal - t.amount;
          if (t.type === 'transfer' && t.walletType === fromWallet) return bal - t.amount;
          if (t.type === 'transfer' && t.toWalletType === fromWallet) return bal + t.amount;
          return bal;
        }, 0);

      if (walletBalance < newAmount) {
        const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
        const fromLabel = fromWallet === 'cash' ? 'Cash' : 'Bank/E-Wallet';
        return NextResponse.json({
          error: `Saldo ${fromLabel} tidak mencukupi. Saldo tersedia: ${fmt.format(walletBalance)}, dibutuhkan: ${fmt.format(newAmount)}.`,
          code: 'INSUFFICIENT_BALANCE',
          available: walletBalance,
        }, { status: 422 });
      }
    }

    txs[idx] = { ...existing, ...body, id, userId: user.userId };
    await writeJSONAsync('transactions.json', txs);
    return NextResponse.json(txs[idx]);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const txs = await readJSONAsync<Transaction>('transactions.json');
    const filtered = txs.filter((t) => !(t.id === id && t.userId === user.userId));
    if (filtered.length === txs.length) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    await writeJSONAsync('transactions.json', filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
