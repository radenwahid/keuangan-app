import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdminAuth } from '@/lib/adminAuth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { User, Transaction, Category, Template } from '@/lib/types';

// Reset password
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const { newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const users = await readJSONAsync<User>('users.json');
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

    users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
    await writeJSONAsync('users.json', users);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Hapus user beserta semua datanya
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminAuth();
    const { id } = await params;

    const users = await readJSONAsync<User>('users.json');
    if (!users.find((u) => u.id === id)) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    await writeJSONAsync('users.json', users.filter((u) => u.id !== id));

    const txs = await readJSONAsync<Transaction>('transactions.json');
    await writeJSONAsync('transactions.json', txs.filter((t) => t.userId !== id));

    const cats = await readJSONAsync<Category>('categories.json');
    await writeJSONAsync('categories.json', cats.filter((c) => c.userId !== id));

    const tpls = await readJSONAsync<Template>('templates.json');
    await writeJSONAsync('templates.json', tpls.filter((t) => t.userId !== id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
