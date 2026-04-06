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
    txs[idx] = { ...txs[idx], ...body, id, userId: user.userId };
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
