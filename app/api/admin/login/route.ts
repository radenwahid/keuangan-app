import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminLogin, signAdminToken } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const admin = await verifyAdminLogin(username, password);
  if (!admin) {
    return NextResponse.json({ error: 'Kredensial salah' }, { status: 401 });
  }

  const token = signAdminToken(admin.id, admin.name);
  const res = NextResponse.json({ success: true });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: '/',
    sameSite: 'lax',
  });
  return res;
}
