import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync } from '@/lib/db';
import { Transaction } from '@/lib/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const txs = (await readJSONAsync<Transaction>('transactions.json')).filter(t => t.userId === user.userId);

    const calc = (wallet: 'cash' | 'bank') =>
      txs.reduce((bal, t) => {
        if (t.type === 'income' && t.walletType === wallet) return bal + t.amount;
        if (t.type === 'expense' && t.walletType === wallet) return bal - t.amount;
        if (t.type === 'transfer' && t.walletType === wallet) return bal - t.amount;
        if (t.type === 'transfer' && t.toWalletType === wallet) return bal + t.amount;
        return bal;
      }, 0);

    return NextResponse.json({ cash: calc('cash'), bank: calc('bank') });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
