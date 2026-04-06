import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { getDefaultCategories } from '@/lib/defaultCategories';
import { generateId } from '@/lib/utils';
import { User, Category } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const users = await readJSONAsync<User>('users.json');
    if (users.find((u) => u.email === email)) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: generateId(),
      name,
      email,
      passwordHash,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeJSONAsync('users.json', users);

    // Seed default categories
    const categories = await readJSONAsync<Category>('categories.json');
    const defaults = getDefaultCategories(newUser.id);
    await writeJSONAsync('categories.json', [...categories, ...defaults]);

    const token = signToken({ userId: newUser.id, email: newUser.email, name: newUser.name });
    const res = NextResponse.json({ success: true, user: { id: newUser.id, name, email } });
    res.cookies.set('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
