import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Transaction, Notification } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    let txs = (await readJSONAsync<Transaction>('transactions.json')).filter((t) => t.userId === user.userId);

    if (month && year) {
      txs = txs.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
      });
    }
    if (type) txs = txs.filter((t) => t.type === type);
    if (category) txs = txs.filter((t) => t.category === category);

    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(txs);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { type, amount, category, note, date, walletType } = body;

    if (!type || !amount || !category || !date) {
      return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 });
    }

    const txs = await readJSONAsync<Transaction>('transactions.json');
    const newTx: Transaction = {
      id: generateId(),
      userId: user.userId,
      type,
      amount: Number(amount),
      category,
      note: note || '',
      date,
      walletType: walletType || 'cash',
      createdAt: new Date().toISOString(),
    };
    txs.push(newTx);
    await writeJSONAsync('transactions.json', txs);

    // Auto-create notification
    const notifs = await readJSONAsync<Notification>('notifications.json');
    const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount));
    notifs.push({
      id: generateId(),
      userId: user.userId,
      title: type === 'income' ? 'Pemasukan dicatat' : 'Pengeluaran dicatat',
      message: `${category} · ${fmt} dari ${walletType === 'bank' ? 'Bank/E-Wallet' : 'Cash'}${note ? ` · ${note}` : ''}`,
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
