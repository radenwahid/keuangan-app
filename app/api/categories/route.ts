import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Category } from '@/lib/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const cats = (await readJSONAsync<Category>('categories.json')).filter((c) => c.userId === user.userId);
    return NextResponse.json(cats);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { name, type, color, icon } = body;
    if (!name || !type) return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 });

    const cats = await readJSONAsync<Category>('categories.json');
    const newCat: Category = {
      id: generateId(),
      userId: user.userId,
      name,
      type,
      color: color || '#EC4899',
      icon: icon || 'Tag',
      isDefault: false,
    };
    cats.push(newCat);
    await writeJSONAsync('categories.json', cats);
    return NextResponse.json(newCat, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
