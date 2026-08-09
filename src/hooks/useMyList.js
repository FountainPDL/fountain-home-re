import { useCallback, useEffect, useState } from "react"

const KEY = "fh_my_list"

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function useMyList() {
  const [list, setList] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(list))
    } catch {
      // storage full/unavailable — list still works for this session
    }
  }, [list])

  const isInList = useCallback(
    (id, mediaType) => list.some((i) => i.id === id && i.media_type === mediaType),
    [list],
  )

  const toggle = useCallback((item) => {
    setList((prev) => {
      const exists = prev.some((i) => i.id === item.id && i.media_type === item.media_type)
      if (exists) return prev.filter((i) => !(i.id === item.id && i.media_type === item.media_type))
      return [{ ...item, addedAt: Date.now() }, ...prev]
    })
  }, [])

  return { list, isInList, toggle }
}
