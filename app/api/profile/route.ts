import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET() {
  try {
    const auth = await requireAuth();
    const users = await readJSONAsync<User>('users.json');
    const user = users.find((u) => u.id === auth.userId);
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    const { passwordHash, ...safe } = user;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth();
    const body = await req.json();
    const users = await readJSONAsync<User>('users.json');
    const idx = users.findIndex((u) => u.id === auth.userId);
    if (idx === -1) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

    if (body.name) users[idx].name = body.name;

    if (body.oldPassword && body.newPassword) {
      const valid = await bcrypt.compare(body.oldPassword, users[idx].passwordHash);
      if (!valid) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
      users[idx].passwordHash = await bcrypt.hash(body.newPassword, 10);
    }

    await writeJSONAsync('users.json', users);
    const { passwordHash, ...safe } = users[idx];
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
