import { useEffect } from "react"

/*
 * Protect the Fountain Home page from unexpected navigation attempts.
 *
 * The player iframe is also sandboxed by Watch.jsx. This prevents the
 * embedded document from freely navigating the top-level Fountain Home page.
 */

export default function RedirectBlocker() {
  useEffect(() => {
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    const allowedNavigation = {
      value: false,
    }

    const isInternalUrl = (url) => {
      try {
        const target = new URL(url, window.location.href)
        return target.origin === window.location.origin
      } catch {
        return true
      }
    }

    window.history.pushState = function (...args) {
      const url = args[2]

      if (url && !isInternalUrl(url) && !allowedNavigation.value) {
        return
      }

      return originalPushState.apply(this, args)
    }

    window.history.replaceState = function (...args) {
      const url = args[2]

      if (url && !isInternalUrl(url) && !allowedNavigation.value) {
        return
      }

      return originalReplaceState.apply(this, args)
    }

    const handleBeforeUnload = (event) => {
      if (event.defaultPrevented) return
      event.preventDefault()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  return null
}
