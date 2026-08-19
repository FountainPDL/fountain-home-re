import { useEffect, useState } from "react"

/**
 * Wraps a TMDB fetcher with loading/error state. `deps` controls when it
 * re-runs. `cancelled` is declared INSIDE the effect (not a shared ref)
 * so each run's callbacks only ever see their own cancellation flag —
 * a shared ref here would let a slow, stale request overwrite a newer
 * one that already resolved first.
 */
export function useTMDB(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Something went wrong")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
