import { useCallback, useEffect, useState } from "react"

const KEY = "fh_continue_watching"
const MAX = 20

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}

function write(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map))
  } catch {
    // ignore
  }
}

const keyFor = (mediaType, id) => `${mediaType}-${id}`

/**
 * Real playback-position tracking. This only ever gets data from a native
 * <video> element (see Watch.jsx) — an <iframe> embed is cross-origin, so
 * there's no way to read its playback position, and this hook makes no
 * attempt to bridge into a specific provider's player to work around that.
 */
export function useContinueWatching() {
  const [map, setMap] = useState(read)

  useEffect(() => write(map), [map])

  const getProgress = useCallback((mediaType, id) => map[keyFor(mediaType, id)] || null, [map])

  const saveProgress = useCallback((entry) => {
    if (!entry?.id || !entry?.mediaType) return
    setMap((prev) => {
      const next = {
        ...prev,
        [keyFor(entry.mediaType, entry.id)]: { ...entry, updatedAt: Date.now() },
      }
      const keys = Object.keys(next).sort((a, b) => next[b].updatedAt - next[a].updatedAt)
      if (keys.length > MAX) keys.slice(MAX).forEach((k) => delete next[k])
      return next
    })
  }, [])

  const removeProgress = useCallback((mediaType, id) => {
    setMap((prev) => {
      const next = { ...prev }
      delete next[keyFor(mediaType, id)]
      return next
    })
  }, [])

  const list = Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt)

  return { list, getProgress, saveProgress, removeProgress }
}
