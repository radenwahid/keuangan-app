/**
 * Simple client-side cache using localStorage with TTL.
 * Reduces redundant API calls for read-only data.
 */

const DEFAULT_TTL = 60 * 1000; // 60 seconds

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export function cacheGet<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`cache:${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(`cache:${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttl };
    localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
  } catch {
    // localStorage might be full, silently ignore
  }
}

export function cacheInvalidate(...keys: string[]): void {
  if (typeof window === 'undefined') return;
  keys.forEach((key) => localStorage.removeItem(`cache:${key}`));
}

export function cacheInvalidatePrefix(prefix: string): void {
  if (typeof window === 'undefined') return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(`cache:${prefix}`)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}
