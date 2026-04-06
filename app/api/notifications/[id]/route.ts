import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { Notification } from '@/lib/types';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const notifs = await readJSONAsync<Notification>('notifications.json');
    const filtered = notifs.filter(n => !(n.id === id && n.userId === user.userId));
    await writeJSONAsync('notifications.json', filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const notifs = await readJSONAsync<Notification>('notifications.json');
    const idx = notifs.findIndex(n => n.id === id && n.userId === user.userId);
    if (idx !== -1) { notifs[idx].read = true; await writeJSONAsync('notifications.json', notifs); }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
