import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { getDefaultCategories } from '@/lib/defaultCategories';
import { generateId } from '@/lib/utils';
import type { User, Category } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await req.json();
    const { name, googleId, email } = body;

    if (!name || !googleId || !email) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const users = await readJSONAsync<User>('users.json');

    // Cek email sudah terdaftar
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Buat user baru
    const newUser: User = {
      id: generateId(),
      name,
      email,
      passwordHash: '', // kosong untuk Google user
      role: 'user',
      provider: 'google',
      googleId,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeJSONAsync('users.json', users);

    // Seed kategori default
    const categories = await readJSONAsync<Category>('categories.json');
    await writeJSONAsync('categories.json', [...categories, ...getDefaultCategories(newUser.id)]);

    // Buat JWT cookie (sistem auth yang sudah ada)
    const token = signToken({ userId: newUser.id, email: newUser.email, name: newUser.name });
    const res = NextResponse.json({ success: true });
    res.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
