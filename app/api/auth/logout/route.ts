import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  // Hapus JWT cookie kita
  res.cookies.set('token', '', { maxAge: 0, path: '/' });
  // Hapus next-auth session cookie juga
  res.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' });
  res.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0, path: '/' });
  return res;
}
