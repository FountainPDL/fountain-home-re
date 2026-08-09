const memoryCache = new Map()
const PREFIX = "fh_cache_"

export const TTL = {
  SHORT: 1000 * 60 * 15, // 15 min — trending/popular/search, changes often
  MEDIUM: 1000 * 60 * 60 * 6, // 6 hours — details/credits/similar
  LONG: 1000 * 60 * 60 * 24, // 24 hours — genre lists, barely change
}

export function cacheGet(key) {
  const mem = memoryCache.get(key)
  if (mem && mem.expires > Date.now()) return mem.value
  if (mem) memoryCache.delete(key)

  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return undefined
    const parsed = JSON.parse(raw)
    if (parsed.expires < Date.now()) {
      localStorage.removeItem(PREFIX + key)
      return undefined
    }
    memoryCache.set(key, parsed)
    return parsed.value
  } catch {
    return undefined
  }
}

export function cacheSet(key, value, ttlMs) {
  const entry = { value, expires: Date.now() + ttlMs }
  memoryCache.set(key, entry)
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable (private browsing etc) — the
    // in-memory cache above still works for the rest of this session.
  }
}

/** Drops expired entries from localStorage. Cheap, safe to call on load. */
export function cachePrune() {
  try {
    const toRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(PREFIX)) continue
      try {
        const parsed = JSON.parse(localStorage.getItem(key))
        if (parsed.expires < Date.now()) toRemove.push(key)
      } catch {
        toRemove.push(key)
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}
