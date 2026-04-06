import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { Category, Transaction } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const cats = await readJSONAsync<Category>('categories.json');
    const idx = cats.findIndex((c) => c.id === id && c.userId === user.userId);
    if (idx === -1) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    cats[idx] = { ...cats[idx], ...body, id, userId: user.userId };
    await writeJSONAsync('categories.json', cats);
    return NextResponse.json(cats[idx]);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const cats = await readJSONAsync<Category>('categories.json');
    const cat = cats.find((c) => c.id === id && c.userId === user.userId);
    if (!cat) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    if (cat.isDefault) return NextResponse.json({ error: 'Kategori default tidak bisa dihapus' }, { status: 400 });

    const txs = await readJSONAsync<Transaction>('transactions.json');
    const used = txs.some((t) => t.userId === user.userId && t.category === cat.name);
    if (used) return NextResponse.json({ error: 'Kategori sudah digunakan dalam transaksi' }, { status: 400 });

    await writeJSONAsync('categories.json', cats.filter((c) => c.id !== id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
