import { TMDB_API_KEY, TMDB_BASE_URL } from "../config/tmdb"
import { cacheGet, cacheSet, TTL } from "./cache"

// If two components ask for the same endpoint in the same tick (e.g. the
// hero banner and a content row both fetching trending on first paint),
// this makes sure only one network request actually goes out.
const inFlight = new Map()

export async function tmdbFetch(endpoint, { ttl = TTL.SHORT } = {}) {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}&language=en-US`

  const cached = cacheGet(url)
  if (cached !== undefined) return cached

  if (inFlight.has(url)) return inFlight.get(url)

  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.status_message || `TMDB request failed (${res.status})`)
      }
      return res.json()
    })
    .then((data) => {
      cacheSet(url, data, ttl)
      return data
    })
    .finally(() => {
      inFlight.delete(url)
    })

  inFlight.set(url, promise)
  return promise
}
