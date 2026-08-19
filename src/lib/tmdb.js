import { tmdbFetch } from "./tmdbClient"
import { TTL } from "./cache"

const withType = (type) => (item) => ({ ...item, media_type: item.media_type || type })

/**
 * True once a title has actually premiered. Used to filter unreleased
 * movies/shows out of the normal browsing rows so nothing shows up before
 * it exists to watch. The Upcoming tab intentionally does NOT use this —
 * showing future releases is the entire point of that one.
 */
export function isReleased(item) {
  const date = item.release_date || item.first_air_date
  if (!date) return false
  return new Date(date).getTime() <= Date.now()
}

const onlyReleased = (list) => list.filter(isReleased)
const onlyPeople = (item) => item.media_type === "movie" || item.media_type === "tv"

/** Reads the Settings > Content > "Hide adult content" toggle (defaults on). */
function includeAdultParam() {
  try {
    const raw = localStorage.getItem("fh_settings")
    const hide = raw ? JSON.parse(raw).adultFilter : true
    return hide === false ? "true" : "false"
  } catch {
    return "false"
  }
}

export async function getTrending(window = "week") {
  const data = await tmdbFetch(`/trending/all/${window}`, { ttl: TTL.SHORT })
  // /trending/all also mixes in "person" results, which have no
  // poster_path/release_date and aren't watchable titles.
  return onlyReleased((data.results || []).filter(onlyPeople))
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch(`/movie/popular?page=${page}`, { ttl: TTL.SHORT })
  return onlyReleased((data.results || []).map(withType("movie")))
}

export async function getPopularTV(page = 1) {
  const data = await tmdbFetch(`/tv/popular?page=${page}`, { ttl: TTL.SHORT })
  return onlyReleased((data.results || []).map(withType("tv")))
}

export async function getTopRatedMovies(page = 1) {
  const data = await tmdbFetch(`/movie/top_rated?page=${page}`, { ttl: TTL.MEDIUM })
  return onlyReleased((data.results || []).map(withType("movie")))
}

export async function getTopRatedTV(page = 1) {
  const data = await tmdbFetch(`/tv/top_rated?page=${page}`, { ttl: TTL.MEDIUM })
  return onlyReleased((data.results || []).map(withType("tv")))
}

// Intentionally NOT release-filtered — showing what's coming soon is the point.
export async function getUpcomingMovies(page = 1) {
  const data = await tmdbFetch(`/movie/upcoming?page=${page}`, { ttl: TTL.SHORT })
  return (data.results || []).map(withType("movie"))
}

export async function getAnime(page = 1) {
  const data = await tmdbFetch(`/discover/tv?with_genres=16&with_keywords=210024&page=${page}`, { ttl: TTL.SHORT })
  return onlyReleased((data.results || []).map(withType("tv")))
}

export async function searchTVShow(query, page = 1) {
  const data = await tmdbFetch(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`, { ttl: TTL.MEDIUM })
  return onlyReleased((data.results || []).map(withType("tv")))
}

export async function searchMulti(query, page = 1, mediaFilter = "all") {
  if (!query?.trim()) return []
  const data = await tmdbFetch(
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=${includeAdultParam()}`,
    { ttl: TTL.SHORT },
  )
  let results = (data.results || []).filter(onlyPeople)
  if (mediaFilter === "movie" || mediaFilter === "tv") {
    results = results.filter((i) => i.media_type === mediaFilter)
  }
  return onlyReleased(results)
}

export async function discoverByGenre(mediaType, genreId, page = 1) {
  const data = await tmdbFetch(
    `/discover/${mediaType}?with_genres=${genreId}&page=${page}&include_adult=${includeAdultParam()}`,
    { ttl: TTL.SHORT },
  )
  return onlyReleased((data.results || []).map(withType(mediaType)))
}

export async function getGenres(mediaType) {
  const data = await tmdbFetch(`/genre/${mediaType}/list`, { ttl: TTL.LONG })
  return data.genres || []
}

export async function getDetails(mediaType, id) {
  return tmdbFetch(`/${mediaType}/${id}?append_to_response=videos,credits,similar,release_dates,content_ratings`, {
    ttl: TTL.MEDIUM,
  })
}

export function getTrailerKey(details) {
  const vids = details?.videos?.results || []
  const trailer =
    vids.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ||
    vids.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    vids.find((v) => v.site === "YouTube")
  return trailer?.key || null
}

export function getCertification(details, mediaType) {
  if (mediaType === "movie") {
    const us = details?.release_dates?.results?.find((r) => r.iso_3166_1 === "US")
    return us?.release_dates?.[0]?.certification || null
  }
  const us = details?.content_ratings?.results?.find((r) => r.iso_3166_1 === "US")
  return us?.rating || null
}
