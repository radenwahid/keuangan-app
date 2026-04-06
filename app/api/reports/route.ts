import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync } from '@/lib/db';
import { Transaction } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const txs = (await readJSONAsync<Transaction>('transactions.json')).filter((t) => {
      const d = new Date(t.date);
      return t.userId === user.userId && d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const totalIncome = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const dailyMap: Record<string, { income: number; expense: number }> = {};
    txs.forEach((t) => {
      const day = t.date.slice(0, 10);
      if (!dailyMap[day]) dailyMap[day] = { income: 0, expense: 0 };
      if (t.type === 'income') dailyMap[day].income += t.amount;
      else dailyMap[day].expense += t.amount;
    });
    const daily = Object.entries(dailyMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const catMap: Record<string, number> = {};
    txs.filter((t) => t.type === 'expense').forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const byCategory = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    return NextResponse.json({ totalIncome, totalExpense, balance: totalIncome - totalExpense, daily, byCategory, transactions: txs });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
