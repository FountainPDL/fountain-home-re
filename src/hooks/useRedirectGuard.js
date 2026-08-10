import { useEffect } from "react"

/*
 * Fountain Home redirect protection.
 *
 * This protects the parent Fountain Home application from navigation
 * attempts made by the watch page/player.
 *
 * IMPORTANT:
 * Cross-origin iframe contents cannot be inspected by JavaScript.
 * Therefore this guard does not attempt to read or manipulate the
 * provider's internal URL.
 */

export function useRedirectGuard(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const originalUrl = window.location.href
    const originalOpen = window.open
    const originalAssign = window.location.assign
    const originalReplace = window.location.replace

    let restoring = false

    const restoreApp = () => {
      if (restoring) return

      restoring = true

      try {
        if (window.location.href !== originalUrl) {
          window.location.replace(originalUrl)
        }
      } catch {
        try {
          window.history.go(0)
        } catch {}
      }

      setTimeout(() => {
        restoring = false
      }, 1000)
    }

    /*
     * Prevent popup windows from the watch page from being opened
     * through the parent window.
     */
    window.open = function (...args) {
      try {
        const url = args[0]

        if (typeof url === "string") {
          const target = new URL(url, window.location.href)

          if (target.origin !== window.location.origin) {
            return null
          }
        }
      } catch {
        return null
      }

      return originalOpen.apply(window, args)
    }

    /*
     * Guard direct parent-window navigation when code on the
     * same-origin application attempts it.
     */
    try {
      window.location.assign = function (url) {
        try {
          const target = new URL(url, window.location.href)

          if (target.origin !== window.location.origin) {
            restoreApp()
            return
          }
        } catch {
          restoreApp()
          return
        }

        return originalAssign.call(window.location, url)
      }

      window.location.replace = function (url) {
        try {
          const target = new URL(url, window.location.href)

          if (target.origin !== window.location.origin) {
            restoreApp()
            return
          }
        } catch {
          restoreApp()
          return
        }

        return originalReplace.call(window.location, url)
      }
    } catch {
      // Some browsers expose location methods as non-configurable.
    }

    /*
     * Keep the application route when the browser history is changed.
     */
    const handlePopState = () => {
      const current = window.location.href

      if (
        current.startsWith("http://") ||
        current.startsWith("https://")
      ) {
        try {
          const currentUrl = new URL(current)
          const appUrl = new URL(originalUrl)

          if (currentUrl.origin !== appUrl.origin) {
            restoreApp()
          }
        } catch {
          restoreApp()
        }
      }
    }

    window.addEventListener("popstate", handlePopState)

    /*
     * Protect the page from attempts to leave through beforeunload.
     * This is intentionally only armed while watching.
     */
    const handleBeforeUnload = (event) => {
      if (restoring) return

      /*
       * Do not show a confirmation dialog during normal page
       * operation. Browsers only allow this event to warn about
       * a navigation they are actually about to perform.
       */
      if (document.fullscreenElement) {
        return
      }

      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("popstate", handlePopState)
      window.removeEventListener("beforeunload", handleBeforeUnload)

      window.open = originalOpen

      try {
        window.location.assign = originalAssign
        window.location.replace = originalReplace
      } catch {}
    }
  }, [enabled])
}
