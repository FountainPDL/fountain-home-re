import { useCallback, useEffect, useState } from "react"

const KEY = "fh_recently_viewed"
const MAX = 20

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items])

  const addView = useCallback((item) => {
    if (!item?.id) return
    setItems((prev) => {
      const filtered = prev.filter((i) => !(i.id === item.id && i.media_type === item.media_type))
      return [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX)
    })
  }, [])

  return { items, addView }
}
