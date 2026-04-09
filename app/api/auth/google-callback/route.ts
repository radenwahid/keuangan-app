import { NextRequest, NextResponse } from 'next/server';
import { readJSONAsync } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import type { User } from '@/lib/types';

/**
 * Dipanggil dari halaman complete-profile atau setelah Google OAuth sukses
 * untuk menukar session next-auth → JWT cookie sistem kita
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 });

    const users = await readJSONAsync<User>('users.json');
    const user = users.find(u => u.email === email);
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
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
