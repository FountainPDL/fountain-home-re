import { tmdbFetch } from "./tmdbClient"
import { TTL } from "./cache"

const withType = (type) => (item) => ({ ...item, media_type: item.media_type || type })

export async function getTrending(window = "week") {
  const data = await tmdbFetch(`/trending/all/${window}`, { ttl: TTL.SHORT })
  return data.results || []
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbFetch(`/movie/popular?page=${page}`, { ttl: TTL.SHORT })
  return (data.results || []).map(withType("movie"))
}

export async function getPopularTV(page = 1) {
  const data = await tmdbFetch(`/tv/popular?page=${page}`, { ttl: TTL.SHORT })
  return (data.results || []).map(withType("tv"))
}

export async function getTopRatedMovies(page = 1) {
  const data = await tmdbFetch(`/movie/top_rated?page=${page}`, { ttl: TTL.MEDIUM })
  return (data.results || []).map(withType("movie"))
}

export async function getTopRatedTV(page = 1) {
  const data = await tmdbFetch(`/tv/top_rated?page=${page}`, { ttl: TTL.MEDIUM })
  return (data.results || []).map(withType("tv"))
}

export async function getUpcomingMovies(page = 1) {
  const data = await tmdbFetch(`/movie/upcoming?page=${page}`, { ttl: TTL.SHORT })
  return (data.results || []).map(withType("movie"))
}

export async function getAnime(page = 1) {
  // TMDB has no dedicated "anime" flag — Animation genre (16) + the anime
  // keyword (210024) is the standard combo for this, carried over from
  // your v0 project's lib/tmdb.ts.
  const data = await tmdbFetch(`/discover/tv?with_genres=16&with_keywords=210024&page=${page}`, { ttl: TTL.SHORT })
  return (data.results || []).map(withType("tv"))
}

export async function searchTVShow(query, page = 1) {
  const data = await tmdbFetch(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`, { ttl: TTL.MEDIUM })
  return (data.results || []).map(withType("tv"))
}

export async function searchMulti(query, page = 1) {
  if (!query?.trim()) return []
  const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`, { ttl: TTL.SHORT })
  return (data.results || []).filter((i) => i.media_type === "movie" || i.media_type === "tv")
}

export async function discoverByGenre(mediaType, genreId, page = 1) {
  const data = await tmdbFetch(`/discover/${mediaType}?with_genres=${genreId}&page=${page}`, { ttl: TTL.SHORT })
  return (data.results || []).map(withType(mediaType))
}

export async function getGenres(mediaType) {
  const data = await tmdbFetch(`/genre/${mediaType}/list`, { ttl: TTL.LONG })
  return data.genres || []
}

/**
 * One request instead of four: videos (trailers), credits (cast), similar
 * titles, and certifications all come back together via append_to_response.
 * This is the biggest single fix for a slow details page.
 */
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
