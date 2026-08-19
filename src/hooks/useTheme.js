import { useCallback, useEffect, useState } from "react"

const KEY = "fh_theme"

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    // ignore
  }
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light"
  }
  return "dark"
}

/** Reads/writes the theme and keeps <html data-theme="..."> in sync. */
export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // ignore
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  return { theme, setTheme, toggleTheme }
}
