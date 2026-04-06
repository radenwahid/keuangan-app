import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { readJSONAsync } from '@/lib/db';
import { User, Transaction, Category, Template } from '@/lib/types';

export async function GET() {
  try {
    await requireAdminAuth();
    const allUsers = await readJSONAsync<User>('users.json');
    const users = allUsers; // tampilkan semua termasuk admin
    const transactions = await readJSONAsync<Transaction>('transactions.json');
    const categories = await readJSONAsync<Category>('categories.json');
    const templates = await readJSONAsync<Template>('templates.json');

    const result = users.map(({ passwordHash, ...u }) => ({
      ...u,
      transactionCount: transactions.filter((t) => t.userId === u.id).length,
      categoryCount: categories.filter((c) => c.userId === u.id && !c.isDefault).length,
      templateCount: templates.filter((t) => t.userId === u.id).length,
    }));

    const now = new Date();
    const stats = {
      totalUsers: users.length,
      totalTransactions: transactions.length,
      totalTemplates: templates.length,
      newThisMonth: users.filter((u) => {
        const d = new Date(u.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    };

    return NextResponse.json({ users: result, stats });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
