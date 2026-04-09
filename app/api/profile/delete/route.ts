import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import type { User, Transaction, Category, Template, Notification } from '@/lib/types';

export async function DELETE() {
  try {
    const auth = await requireAuth();
    const userId = auth.userId;

    // Hapus user
    const users = await readJSONAsync<User>('users.json');
    await writeJSONAsync('users.json', users.filter(u => u.id !== userId));

    // Hapus semua data milik user
    const txs = await readJSONAsync<Transaction>('transactions.json');
    await writeJSONAsync('transactions.json', txs.filter(t => t.userId !== userId));

    const cats = await readJSONAsync<Category>('categories.json');
    await writeJSONAsync('categories.json', cats.filter(c => c.userId !== userId));

    const tpls = await readJSONAsync<Template>('templates.json');
    await writeJSONAsync('templates.json', tpls.filter(t => t.userId !== userId));

    const notifs = await readJSONAsync<Notification>('notifications.json');
    await writeJSONAsync('notifications.json', notifs.filter(n => n.userId !== userId));

    // Hapus semua cookie auth
    const res = NextResponse.json({ success: true });
    res.cookies.set('token', '', { maxAge: 0, path: '/' });
    res.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' });
    res.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0, path: '/' });
    return res;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
