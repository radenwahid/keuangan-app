import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth, updateAdminPassword, updateAdminUsername } from '@/lib/adminAuth';
import { readJSONAsync } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET() {
  try {
    const admin = await requireAdminAuth();
    const users = await readJSONAsync<User>('users.json');
    const user = users.find((u) => u.id === admin.userId);
    return NextResponse.json({ username: user?.name ?? admin.username });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdminAuth();
    const body = await req.json();

    if (body.type === 'password') {
      const result = await updateAdminPassword(admin.userId, body.oldPassword, body.newPassword);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (body.type === 'username') {
      const result = await updateAdminUsername(admin.userId, body.currentPassword, body.newUsername);
      if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Tipe tidak valid' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
