import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

// Deteksi environment: Vercel (production) atau lokal
const isVercel = process.env.VERCEL === '1' || !!process.env.KV_REST_API_URL;

// ── LOCAL (dev) ──────────────────────────────────────────────
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

// ── VERCEL KV (production) ───────────────────────────────────
// Key: nama file tanpa .json, contoh: "users", "transactions"
function kvKey(filename: string): string {
  return filename.replace('.json', '');
}

async function kvRead<T>(filename: string): Promise<T[]> {
  const data = await kv.get<T[]>(kvKey(filename));
  return data ?? [];
}

async function kvWrite<T>(filename: string, data: T[]): Promise<void> {
  await kv.set(kvKey(filename), data);
}

// ── PUBLIC API ───────────────────────────────────────────────
// Fungsi sync untuk kompatibilitas lokal, async untuk KV
export function readJSON<T>(filename: string): T[] {
  if (isVercel) {
    throw new Error('Gunakan readJSONAsync di Vercel');
  }
  return localRead<T>(filename);
}

export function writeJSON<T>(filename: string, data: T[]): void {
  if (isVercel) {
    throw new Error('Gunakan writeJSONAsync di Vercel');
  }
  localWrite(filename, data);
}

export async function readJSONAsync<T>(filename: string): Promise<T[]> {
  if (isVercel) return kvRead<T>(filename);
  return localRead<T>(filename);
}

export async function writeJSONAsync<T>(filename: string, data: T[]): Promise<void> {
  if (isVercel) return kvWrite(filename, data);
  localWrite(filename, data);
}
