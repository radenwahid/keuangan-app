import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const USER_SECRET = process.env.JWT_SECRET!;
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET!;

// Route yang butuh auth admin
const ADMIN_PROTECTED = ['/panel/dashboard', '/panel/profile'];

// Route yang butuh auth user (semua di bawah dashboard group)
const USER_PROTECTED = [
  '/transactions', '/categories', '/templates', '/reports', '/profile',
];

function isAdminProtected(pathname: string) {
  return ADMIN_PROTECTED.some((p) => pathname.startsWith(p));
}

function isUserProtected(pathname: string) {
  // root "/" juga protected
  if (pathname === '/') return true;
  return USER_PROTECTED.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin routes ──────────────────────────────────────────
  if (isAdminProtected(pathname)) {
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/panel', req.url));
    }

    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(ADMIN_SECRET)
      );
      // valid, lanjut
      return NextResponse.next();
    } catch {
      // token expired atau invalid
      const res = NextResponse.redirect(new URL('/panel', req.url));
      res.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
      return res;
    }
  }

  // ── User routes ───────────────────────────────────────────
  if (isUserProtected(pathname)) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(USER_SECRET)
      );
      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.set('token', '', { maxAge: 0, path: '/' });
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
