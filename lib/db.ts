import fs from 'fs';
import path from 'path';

const isVercel = !!process.env.KV_REST_API_URL;

// ── LOCAL ────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function localRead<T>(filename: string): T[] {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T[];
  } catch {
    return [];
  }
}

function localWrite<T>(filename: string, data: T[]): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

// ── VERCEL KV (lazy import) ──────────────────────────────────
function kvKey(filename: string): string {
  return filename.replace('.json', '');
}

async function kvRead<T>(filename: string): Promise<T[]> {
  const { kv } = await import('@vercel/kv');
  const data = await kv.get<T[]>(kvKey(filename));
  return data ?? [];
}

async function kvWrite<T>(filename: string, data: T[]): Promise<void> {
  const { kv } = await import('@vercel/kv');
  await kv.set(kvKey(filename), data);
}

// ── PUBLIC API ───────────────────────────────────────────────
export async function readJSONAsync<T>(filename: string): Promise<T[]> {
  if (isVercel) return kvRead<T>(filename);
  return localRead<T>(filename);
}

export async function writeJSONAsync<T>(filename: string, data: T[]): Promise<void> {
  if (isVercel) return kvWrite(filename, data);
  localWrite(filename, data);
}

// Sync fallback untuk kompatibilitas lokal (tidak dipakai di Vercel)
export function readJSON<T>(filename: string): T[] {
  return localRead<T>(filename);
}

export function writeJSON<T>(filename: string, data: T[]): void {
  localWrite(filename, data);
}
