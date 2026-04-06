import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Transaction } from '@/lib/types';

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
    const { type, amount, category, note, date } = body;

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
      createdAt: new Date().toISOString(),
    };
    txs.push(newTx);
    await writeJSONAsync('transactions.json', txs);
    return NextResponse.json(newTx, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
