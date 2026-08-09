export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || "8baba8ab6b8bbe247645bcae7df63d0d"
export const TMDB_BASE_URL = "https://api.themoviedb.org/3"
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

/**
 * Every helper below returns `null` when there's no path, instead of a
 * malformed URL. That null is what lets <ImageWithFallback> render a clean
 * placeholder instead of a broken-image icon — this is the actual fix for
 * "posters are broken", along with never trusting poster_path to be present.
 */
export function posterUrl(path, size = "w500") {
  if (!path) return null
  return `${IMAGE_BASE_URL}/${size}${path}`
}

export function backdropUrl(path, size = "w1280") {
  if (!path) return null
  return `${IMAGE_BASE_URL}/${size}${path}`
}

export function profileUrl(path, size = "w185") {
  if (!path) return null
  return `${IMAGE_BASE_URL}/${size}${path}`
}
