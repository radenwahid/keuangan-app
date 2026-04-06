import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Template } from '@/lib/types';

export async function GET() {
  try {
    const user = await requireAuth();
    const templates = (await readJSONAsync<Template>('templates.json')).filter((t) => t.userId === user.userId);
    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { name, type, amount, category, note } = body;
    if (!name || !type) return NextResponse.json({ error: 'Field tidak lengkap' }, { status: 400 });

    const templates = await readJSONAsync<Template>('templates.json');
    const newTemplate: Template = {
      id: generateId(),
      userId: user.userId,
      name,
      type,
      amount: Number(amount) || 0,
      category: category || '',
      note: note || '',
    };
    templates.push(newTemplate);
    await writeJSONAsync('templates.json', templates);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
