import { useEffect, useRef, useState } from "react"

/**
 * Wraps a TMDB fetcher with loading/error state. `deps` controls when it
 * re-runs, same idea as useEffect deps. Ignores results from a request
 * that's since been superseded (e.g. the user changed pages before the
 * first one resolved).
 */
export function useTMDB(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled.current) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled.current) {
          setError(err?.message || "Something went wrong")
          setLoading(false)
        }
      })

    return () => {
      cancelled.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
