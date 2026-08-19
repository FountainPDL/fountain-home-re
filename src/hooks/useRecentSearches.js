import { useCallback, useEffect, useState } from "react"

const KEY = "fh_recent_searches"
const MAX = 8

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function useRecentSearches() {
  const [terms, setTerms] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(terms))
    } catch {
      // ignore
    }
  }, [terms])

  const addTerm = useCallback((term) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setTerms((prev) => [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX))
  }, [])

  const clearTerms = useCallback(() => setTerms([]), [])

  return { terms, addTerm, clearTerms }
}
