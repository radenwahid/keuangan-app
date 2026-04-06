import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { readJSONAsync, writeJSONAsync } from '@/lib/db';
import { Template } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const templates = await readJSONAsync<Template>('templates.json');
    const idx = templates.findIndex((t) => t.id === id && t.userId === user.userId);
    if (idx === -1) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    templates[idx] = { ...templates[idx], ...body, id, userId: user.userId };
    await writeJSONAsync('templates.json', templates);
    return NextResponse.json(templates[idx]);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const templates = await readJSONAsync<Template>('templates.json');
    const filtered = templates.filter((t) => !(t.id === id && t.userId === user.userId));
    if (filtered.length === templates.length) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    await writeJSONAsync('templates.json', filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
