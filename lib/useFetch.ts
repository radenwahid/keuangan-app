/**
 * useFetch — cached fetch hook.
 * - Serves from localStorage cache if still fresh (TTL).
 * - Falls back to network on miss/expiry.
 * - `invalidateKeys` clears related cache entries after a mutation.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheGet, cacheSet, cacheInvalidate } from './cache';

interface UseFetchOptions {
  ttl?: number;          // ms, default 60s
  skip?: boolean;        // skip fetching
}

export function useFetch<T>(url: string | null, options: UseFetchOptions = {}) {
  const { ttl = 60_000, skip = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip && !!url);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (forceRefresh = false) => {
      if (!url || skip) return;

      // Serve from cache if available and not forcing refresh
      if (!forceRefresh) {
        const cached = cacheGet<T>(url);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return;
        }
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, { signal: abortRef.current.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: T = await res.json();
        cacheSet(url, json, ttl);
        setData(json);
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== 'AbortError') {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, skip, ttl]
  );

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  /** Call after mutations to bust cache and re-fetch */
  const refresh = useCallback(
    (...invalidateUrls: string[]) => {
      if (url) cacheInvalidate(url, ...invalidateUrls);
      else cacheInvalidate(...invalidateUrls);
      load(true);
    },
    [url, load]
  );

  return { data, loading, error, refresh };
}
