import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { Notification } from '@/lib/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const notifs = (await readJSONAsync<Notification>('notifications.json'))
      .filter(n => n.userId === user.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(notifs);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();
    const notifs = await readJSONAsync<Notification>('notifications.json');
    await writeJSONAsync('notifications.json', notifs.filter(n => n.userId !== user.userId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
