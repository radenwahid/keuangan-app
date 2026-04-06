import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { User } from '@/lib/types';

export async function POST() {
  try {
    const auth = await requireAuth();
    const users = await readJSONAsync<User>('users.json');
    const idx = users.findIndex(u => u.id === auth.userId);
    if (idx !== -1) {
      users[idx].onboardingDone = true;
      await writeJSONAsync('users.json', users);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
