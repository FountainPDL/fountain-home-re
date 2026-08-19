import { useCallback, useEffect, useState } from "react"

const KEY = "fh_settings"

const DEFAULTS = {
  autoplayNext: true,
  adultFilter: true, // true = hide adult content (TMDB include_adult=false)
}

function read() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }
  } catch {
    return DEFAULTS
  }
}

/** Small local-only preferences that aren't the video source (that stays as-is). */
export function useSettings() {
  const [settings, setSettings] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  const update = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return { settings, update }
}
