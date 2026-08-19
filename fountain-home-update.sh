#!/usr/bin/env bash
# Fountain Home — feature update
# Run this from the ROOT of your fountain-home-re checkout in Termux:
#   bash fountain-home-update.sh
#
# It only writes the files listed below. Your videoSource.js,
# RedirectBlocker.jsx, useRedirectGuard.js, and SourceSelector.jsx are
# NOT touched by this script.
set -e

if [ ! -f "package.json" ] || [ ! -d "src" ]; then
  echo "Run this from the root of your fountain-home-re checkout (no package.json/src found here)."
  exit 1
fi

mkdir -p src/hooks src/components src/pages src/lib src/config

mkdir -p "."
cat > "tailwind.config.js" << 'FH_UPDATE_EOF_MARKER'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: { DEFAULT: "#8A2BE2", light: "#C084FC", dark: "#5B21B6" },
          green: { DEFAULT: "#22C55E", light: "#4ADE80", dark: "#15803D" },
          red: { DEFAULT: "#E11D48", light: "#FB7185", dark: "#9F1239" },
        },
        bg: {
          DEFAULT: "rgb(var(--c-bg) / <alpha-value>)",
          surface: "rgb(var(--c-bg-surface) / <alpha-value>)",
          surface2: "rgb(var(--c-bg-surface2) / <alpha-value>)",
          border: "rgb(var(--c-bg-border) / <alpha-value>)",
        },
        ink: "rgb(var(--c-ink) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #5B21B6 0%, #8A2BE2 50%, #C084FC 100%)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
}
FH_UPDATE_EOF_MARKER
echo "  updated: tailwind.config.js"

mkdir -p "."
cat > "index.html" << 'FH_UPDATE_EOF_MARKER'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="./favicon.png" />
    <link rel="apple-touch-icon" href="./app-icon-dark.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <meta name="theme-color" content="#0B0812" />
    <script>
      try {
        var t = localStorage.getItem("fh_theme");
        if (t !== "light" && t !== "dark") {
          t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        }
        document.documentElement.setAttribute("data-theme", t);
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    </script>
    <meta name="description" content="Fountain Home — discover trending, popular, and top-rated movies & TV shows." />

    <meta property="og:title" content="Fountain Home" />
    <meta property="og:description" content="Discover trending, popular, and top-rated movies & TV shows." />
    <meta property="og:image" content="./app-icon-dark.png" />
    <meta property="og:type" content="website" />

    <link rel="preconnect" href="https://image.tmdb.org" />
    <link rel="preconnect" href="https://api.themoviedb.org" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <title>Fountain Home</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
FH_UPDATE_EOF_MARKER
echo "  updated: index.html"

mkdir -p "src"
cat > "src/index.css" << 'FH_UPDATE_EOF_MARKER'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Dark theme (default) */
  --c-bg: 11 8 18;
  --c-bg-surface: 22 16 34;
  --c-bg-surface2: 31 24 48;
  --c-bg-border: 42 35 56;
  --c-ink: 255 255 255;
}

:root[data-theme="light"] {
  --c-bg: 250 249 252;
  --c-bg-surface: 255 255 255;
  --c-bg-surface2: 243 241 247;
  --c-bg-border: 224 220 233;
  --c-ink: 17 14 23;
}

html {
  scroll-behavior: smooth;
}

body {
  @apply bg-bg text-ink font-sans antialiased;
  transition: background-color 0.2s ease, color 0.2s ease;
}

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  @apply bg-bg-border rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-brand-purple/50;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.text-gradient {
  background: linear-gradient(90deg, #c084fc, #8a2be2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.text-balance {
  text-wrap: balance;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/index.css"

mkdir -p "src/lib"
cat > "src/lib/tmdb.js" << 'FH_UPDATE_EOF_MARKER'
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
FH_UPDATE_EOF_MARKER
echo "  updated: src/lib/tmdb.js"

mkdir -p "src/hooks"
cat > "src/hooks/useTMDB.js" << 'FH_UPDATE_EOF_MARKER'
import { useEffect, useState } from "react"

/**
 * Wraps a TMDB fetcher with loading/error state. `deps` controls when it
 * re-runs. `cancelled` is declared INSIDE the effect (not a shared ref)
 * so each run's callbacks only ever see their own cancellation flag —
 * a shared ref here would let a slow, stale request overwrite a newer
 * one that already resolved first.
 */
export function useTMDB(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || "Something went wrong")
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/hooks/useTMDB.js"

mkdir -p "src/hooks"
cat > "src/hooks/useTheme.js" << 'FH_UPDATE_EOF_MARKER'
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
FH_UPDATE_EOF_MARKER
echo "  updated: src/hooks/useTheme.js"

mkdir -p "src/hooks"
cat > "src/hooks/useSettings.js" << 'FH_UPDATE_EOF_MARKER'
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
FH_UPDATE_EOF_MARKER
echo "  updated: src/hooks/useSettings.js"

mkdir -p "src/hooks"
cat > "src/hooks/useContinueWatching.js" << 'FH_UPDATE_EOF_MARKER'
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
FH_UPDATE_EOF_MARKER
echo "  updated: src/hooks/useContinueWatching.js"

mkdir -p "src/hooks"
cat > "src/hooks/useRecentSearches.js" << 'FH_UPDATE_EOF_MARKER'
import { useCallback, useEffect, useState } from "react"

const KEY = "fh_recent_searches"
const MAX = 8

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function useRecentSearches() {
  const [terms, setTerms] = useState(read)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(terms))
    } catch {
      // ignore
    }
  }, [terms])

  const addTerm = useCallback((term) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setTerms((prev) => [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX))
  }, [])

  const clearTerms = useCallback(() => setTerms([]), [])

  return { terms, addTerm, clearTerms }
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/hooks/useRecentSearches.js"

mkdir -p "src/components"
cat > "src/components/ThemeToggle.jsx" << 'FH_UPDATE_EOF_MARKER'
import { Sun, Moon } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

/** variant="icon" for a compact navbar button, "full" for a labeled settings row. */
export default function ThemeToggle({ variant = "icon" }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-bg-surface2 border border-bg-border rounded-lg p-1">
      <button
        onClick={() => isDark || toggleTheme()}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
          isDark ? "bg-brand-purple text-white" : "text-ink/60 hover:text-ink"
        }`}
      >
        <Moon className="w-4 h-4" /> Dark
      </button>
      <button
        onClick={() => isDark && toggleTheme()}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
          !isDark ? "bg-brand-purple text-white" : "text-ink/60 hover:text-ink"
        }`}
      >
        <Sun className="w-4 h-4" /> Light
      </button>
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/components/ThemeToggle.jsx"

mkdir -p "src/components"
cat > "src/components/PosterCard.jsx" << 'FH_UPDATE_EOF_MARKER'
import { Link } from "react-router-dom"
import { Star, Play } from "lucide-react"
import ImageWithFallback from "./ImageWithFallback"
import { posterUrl } from "../config/tmdb"

/** progress: optional 0-100, renders a Continue Watching style progress bar. */
export default function PosterCard({ item, progress }) {
  const title = item.title || item.name || "Untitled"
  const year = (item.release_date || item.first_air_date || "").split("-")[0]
  const mediaType = item.media_type || (item.title ? "movie" : "tv")
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null

  return (
    <Link to={`/${mediaType}/${item.id}`} className="group block w-full">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-bg-surface border border-bg-border transition-all duration-300 group-hover:-translate-y-1 group-hover:border-brand-purple/60 group-hover:shadow-lg group-hover:shadow-brand-purple/20">
        <ImageWithFallback
          src={posterUrl(item.poster_path)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          fallbackClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <div className="flex items-center gap-1.5 text-white bg-brand-purple/90 rounded-full px-2.5 py-1 text-xs font-semibold">
            <Play className="w-3 h-3 fill-white" /> View
          </div>
        </div>
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-white">
            <Star className="w-3 h-3 fill-brand-green text-brand-green" />
            {rating}
          </div>
        )}
        {typeof progress === "number" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
            <div className="h-full bg-brand-red" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-ink/90 line-clamp-1">{title}</h3>
        {year && <p className="text-xs text-ink/50">{year}</p>}
      </div>
    </Link>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/components/PosterCard.jsx"

mkdir -p "src/components"
cat > "src/components/ContentRow.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import PosterCard from "./PosterCard"
import { RowSkeleton } from "./Skeletons"

/** getProgress: optional (item) => number|undefined, to show progress bars (Continue Watching row). */
export default function ContentRow({ title, items, loading, error, getProgress }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" })
  }

  if (!loading && !error && (!items || items.length === 0)) return null

  return (
    <section className="py-4 md:py-6">
      <div className="flex items-center justify-between px-4 md:px-8 mb-3">
        <h2 className="text-lg md:text-2xl font-bold text-ink">{title}</h2>
      </div>

      {loading ? (
        <RowSkeleton />
      ) : error ? (
        <p className="px-4 md:px-8 text-sm text-ink/40">Couldn't load this row right now.</p>
      ) : (
        <div className="group/row relative">
          <button
            onClick={() => scroll(-1)}
            className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-r from-bg to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8 text-ink" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x px-4 md:px-8 pb-2"
          >
            {items.map((item) => (
              <div key={`${item.media_type}-${item.id}`} className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[190px] snap-start">
                <PosterCard item={item} progress={getProgress?.(item)} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-l from-bg to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8 text-ink" />
          </button>
        </div>
      )}
    </section>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/components/ContentRow.jsx"

mkdir -p "src/components"
cat > "src/components/Footer.jsx" << 'FH_UPDATE_EOF_MARKER'
export default function Footer() {
  return (
    <footer className="border-t border-bg-border mt-16 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink/40">
        <div className="flex items-center gap-2">
          <img src="./logo-mark.png" alt="" className="w-6 h-6 rounded-full" />
          <span className="font-semibold text-ink/70">Fountain Home</span>
        </div>
        <p className="text-center max-w-md">
          Movie & TV data provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-ink/70"
          >
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/components/Footer.jsx"

mkdir -p "src/components"
cat > "src/components/ImageWithFallback.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useState, useEffect } from "react"
import { Clapperboard } from "lucide-react"

export default function ImageWithFallback({ src, alt = "", className = "", fallbackClassName = "" }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-bg-surface2 text-ink/15 ${fallbackClassName || className}`}>
        <Clapperboard className="w-1/4 h-1/4 min-w-6 min-h-6" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/components/ImageWithFallback.jsx"

mkdir -p "src/components"
cat > "src/components/EpisodeSelector.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"

export default function EpisodeSelector({ seasons, tmdbId, currentSeason, currentEpisode }) {
  const validSeasons = (seasons || []).filter((s) => s.season_number > 0)
  const [season, setSeason] = useState(Number(currentSeason) || validSeasons[0]?.season_number || 1)
  const navigate = useNavigate()

  const activeSeason = validSeasons.find((s) => s.season_number === season)
  const episodeCount = activeSeason?.episode_count || 0

  const goTo = (s, e) => navigate(`/watch/tv/${tmdbId}/${s}/${e}`)

  if (validSeasons.length === 0) return null

  return (
    <div className="bg-bg-surface border border-bg-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="font-semibold text-ink">Episodes</h3>
        <div className="relative">
          <select
            value={season}
            onChange={(e) => {
              const s = Number(e.target.value)
              setSeason(s)
              goTo(s, 1)
            }}
            className="appearance-none bg-bg-surface2 border border-bg-border text-ink rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:border-brand-purple/60"
          >
            {validSeasons.map((s) => (
              <option key={s.season_number} value={s.season_number}>
                {s.name || `Season ${s.season_number}`}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink/50" />
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
          <button
            key={ep}
            onClick={() => goTo(season, ep)}
            className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
              Number(currentSeason) === season && Number(currentEpisode) === ep
                ? "bg-brand-purple text-white"
                : "bg-bg-surface2 hover:bg-bg-border text-ink/70"
            }`}
          >
            {ep}
          </button>
        ))}
      </div>
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/components/EpisodeSelector.jsx"

mkdir -p "src/components"
cat > "src/components/Navbar.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Search, Menu, X, Settings as SettingsIcon } from "lucide-react"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setMenuOpen(false)
    }
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-white ${isActive ? "text-white" : "text-white/60"}`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-bg/95 backdrop-blur-md border-b border-bg-border" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="./logo-mark.png" alt="" className="w-8 h-8 rounded-full" />
            <span className="font-extrabold text-lg tracking-tight text-white">
              Fountain <span className="text-gradient">Home</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/movies" className={linkClass}>
              Movies
            </NavLink>
            <NavLink to="/tv" className={linkClass}>
              TV Shows
            </NavLink>
            <NavLink to="/my-list" className={linkClass}>
              My List
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <form onSubmit={submitSearch} className="hidden sm:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search titles..."
                aria-label="Search titles"
                className="w-40 md:w-64 bg-white/10 focus:bg-white/15 border border-white/10 focus:border-brand-purple/60 rounded-full py-2 pl-9 pr-4 text-sm outline-none transition-all text-white placeholder:text-white/40"
              />
            </div>
          </form>

          <ThemeToggle variant="icon" />

          <Link
            to="/settings"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="w-[18px] h-[18px]" />
          </Link>

          <button className="md:hidden text-white" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-bg border-t border-bg-border px-4 py-4 space-y-4">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search titles..."
              aria-label="Search titles"
              className="w-full bg-bg-surface2 border border-bg-border rounded-full py-2 pl-9 pr-4 text-sm outline-none text-ink placeholder:text-ink/40"
            />
          </form>
          <nav className="flex flex-col gap-3">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              Home
            </NavLink>
            <NavLink to="/movies" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              Movies
            </NavLink>
            <NavLink to="/tv" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              TV Shows
            </NavLink>
            <NavLink to="/my-list" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              My List
            </NavLink>
            <NavLink to="/settings" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium flex items-center gap-2 ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              <SettingsIcon className="w-4 h-4" /> Settings
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/components/Navbar.jsx"

mkdir -p "src/pages"
cat > "src/pages/NotFound.jsx" << 'FH_UPDATE_EOF_MARKER'
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-extrabold text-gradient">404</h1>
      <p className="text-ink/50">This page doesn't exist.</p>
      <Link
        to="/"
        className="bg-brand-purple hover:bg-brand-purple-dark px-5 py-2.5 rounded-lg font-semibold transition-colors text-white"
      >
        Back to Home
      </Link>
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/NotFound.jsx"

mkdir -p "src/pages"
cat > "src/pages/Home.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useTMDB } from "../hooks/useTMDB"
import { getTrending, getPopularMovies, getPopularTV, getTopRatedMovies, getAnime, searchTVShow } from "../lib/tmdb"
import HeroBanner from "../components/HeroBanner"
import ContentRow from "../components/ContentRow"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"
import { useContinueWatching } from "../hooks/useContinueWatching"

export default function Home() {
  const trending = useTMDB(() => getTrending("week"), [])
  const popularMovies = useTMDB(() => getPopularMovies(), [])
  const popularTV = useTMDB(() => getPopularTV(), [])
  const topRated = useTMDB(() => getTopRatedMovies(), [])
  const anime = useTMDB(() => getAnime(), [])
  const powerRangers = useTMDB(() => searchTVShow("power rangers"), [])
  const { items: recent } = useRecentlyViewed()
  const { list: continueWatching, getProgress } = useContinueWatching()

  const continueWatchingItems = continueWatching.map((c) => ({
    id: c.id,
    media_type: c.mediaType,
    title: c.title,
    name: c.name,
    poster_path: c.poster_path,
  }))
  const progressFor = (item) => {
    const p = getProgress(item.media_type, item.id)
    return p?.duration ? (p.position / p.duration) * 100 : undefined
  }

  return (
    <div className="pb-16">
      <HeroBanner items={trending.data} loading={trending.loading} />

      {continueWatchingItems.length > 0 && (
        <ContentRow title="Continue Watching" items={continueWatchingItems} getProgress={progressFor} />
      )}

      {recent.length > 0 && <ContentRow title="Continue Browsing" items={recent} />}

      <ContentRow title="Trending This Week" items={trending.data} loading={trending.loading} error={trending.error} />
      <ContentRow title="Popular Movies" items={popularMovies.data} loading={popularMovies.loading} error={popularMovies.error} />
      <ContentRow title="Popular TV Shows" items={popularTV.data} loading={popularTV.loading} error={popularTV.error} />
      <ContentRow title="Top Rated Movies" items={topRated.data} loading={topRated.loading} error={topRated.error} />
      <ContentRow title="Anime" items={anime.data} loading={anime.loading} error={anime.error} />
      <ContentRow title="Power Rangers" items={powerRangers.data} loading={powerRangers.loading} error={powerRangers.error} />
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/Home.jsx"

mkdir -p "src/pages"
cat > "src/pages/Details.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Play, Plus, Check, Star, Clock, Calendar, Film, Share2 } from "lucide-react"
import { useTMDB } from "../hooks/useTMDB"
import { getDetails, getTrailerKey, getCertification } from "../lib/tmdb"
import { backdropUrl, posterUrl, profileUrl } from "../config/tmdb"
import { useMyList } from "../hooks/useMyList"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"
import ImageWithFallback from "../components/ImageWithFallback"
import ContentRow from "../components/ContentRow"
import TrailerModal from "../components/TrailerModal"

export default function Details() {
  const { mediaType, id } = useParams()
  const { data, loading, error } = useTMDB(() => getDetails(mediaType, id), [mediaType, id])
  const [showTrailer, setShowTrailer] = useState(false)
  const [shared, setShared] = useState(false)
  const { isInList, toggle } = useMyList()
  const { addView } = useRecentlyViewed()

  useEffect(() => {
    if (data) {
      addView({
        id: data.id,
        media_type: mediaType,
        title: data.title,
        name: data.name,
        poster_path: data.poster_path,
      })
      document.title = `${data.title || data.name} — Fountain Home`
    }
    return () => {
      document.title = "Fountain Home"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading…</div>
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-ink/50 px-4 text-center">
        <p>Couldn't load this title. {error}</p>
        <Link to="/" className="text-brand-purple underline">
          Back home
        </Link>
      </div>
    )
  }

  const title = data.title || data.name
  const year = (data.release_date || data.first_air_date || "").split("-")[0]
  const runtime = data.runtime || data.episode_run_time?.[0]
  const trailerKey = getTrailerKey(data)
  const certification = getCertification(data, mediaType)
  const cast = (data.credits?.cast || []).slice(0, 12)
  const similar = (data.similar?.results || []).map((s) => ({ ...s, media_type: mediaType }))
  const inList = isInList(data.id, mediaType)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      // clipboard unavailable — nothing more we can do silently
    }
  }

  return (
    <div className="min-h-screen">
      <div className="relative w-full h-[45vh] md:h-[60vh]">
        <ImageWithFallback
          src={backdropUrl(data.backdrop_path, "original")}
          alt={title}
          className="w-full h-full object-cover"
          fallbackClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/20" />
      </div>

      <div className="relative -mt-24 md:-mt-40 px-4 md:px-8 pb-16">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="w-40 md:w-64 shrink-0 mx-auto md:mx-0">
            <div className="rounded-xl overflow-hidden border border-bg-border shadow-2xl aspect-[2/3]">
              <ImageWithFallback
                src={posterUrl(data.poster_path, "w500")}
                alt={title}
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-full"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-extrabold text-balance text-ink">{title}</h1>
            {data.tagline && <p className="text-ink/50 italic">{data.tagline}</p>}

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 text-sm text-ink">
              {data.vote_average > 0 && (
                <span className="flex items-center gap-1 bg-bg-surface2 rounded-full px-3 py-1">
                  <Star className="w-4 h-4 fill-brand-green text-brand-green" /> {data.vote_average.toFixed(1)}
                </span>
              )}
              {year && (
                <span className="flex items-center gap-1 bg-bg-surface2 rounded-full px-3 py-1">
                  <Calendar className="w-4 h-4" /> {year}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1 bg-bg-surface2 rounded-full px-3 py-1">
                  <Clock className="w-4 h-4" /> {mediaType === "tv" ? `${runtime}min/ep` : `${runtime}min`}
                </span>
              )}
              {certification && (
                <span className="bg-brand-red/80 text-white rounded-full px-3 py-1 font-semibold">{certification}</span>
              )}
              {mediaType === "tv" && data.number_of_seasons && (
                <span className="flex items-center gap-1 bg-bg-surface2 rounded-full px-3 py-1">
                  <Film className="w-4 h-4" /> {data.number_of_seasons} Season{data.number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {data.genres?.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {data.genres.map((g) => (
                  <span
                    key={g.id}
                    className="text-xs uppercase tracking-wide text-brand-purple-light border border-brand-purple/40 rounded-full px-3 py-1"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-ink/70 leading-relaxed max-w-2xl mx-auto md:mx-0">{data.overview}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <Link
                to={`/watch/${mediaType}/${data.id}${mediaType === "tv" ? "/1/1" : ""}`}
                className="flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
              >
                <Play className="w-5 h-5 fill-black" /> Watch Now
              </Link>
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 bg-bg-surface2 border border-bg-border text-ink font-semibold px-5 py-2.5 rounded-lg hover:bg-bg-surface transition-colors"
                >
                  <Film className="w-5 h-5" /> Trailer
                </button>
              )}
              <button
                onClick={() =>
                  toggle({
                    id: data.id,
                    media_type: mediaType,
                    title: data.title,
                    name: data.name,
                    poster_path: data.poster_path,
                    vote_average: data.vote_average,
                  })
                }
                className="flex items-center gap-2 bg-bg-surface2 border border-bg-border text-ink font-semibold px-5 py-2.5 rounded-lg hover:bg-bg-surface transition-colors"
              >
                {inList ? <Check className="w-5 h-5 text-brand-green" /> : <Plus className="w-5 h-5" />}
                {inList ? "In My List" : "My List"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-bg-surface2 border border-bg-border text-ink font-semibold px-5 py-2.5 rounded-lg hover:bg-bg-surface transition-colors"
              >
                <Share2 className="w-5 h-5" /> {shared ? "Link copied!" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 text-ink">Cast</h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-24 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-surface2 border border-bg-border">
                    <ImageWithFallback
                      src={profileUrl(person.profile_path)}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      fallbackClassName="w-full h-full"
                    />
                  </div>
                  <p className="text-xs font-medium mt-2 line-clamp-1 text-ink">{person.name}</p>
                  <p className="text-xs text-ink/40 line-clamp-1">{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {similar.length > 0 && <ContentRow title="You Might Also Like" items={similar} />}

      {showTrailer && <TrailerModal youtubeKey={trailerKey} onClose={() => setShowTrailer(false)} />}
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/Details.jsx"

mkdir -p "src/pages"
cat > "src/pages/Browse.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useTMDB } from "../hooks/useTMDB"
import {
  getGenres,
  discoverByGenre,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTopRatedTV,
  getUpcomingMovies,
} from "../lib/tmdb"
import PosterCard from "../components/PosterCard"
import { PosterSkeleton } from "../components/Skeletons"

const SORTS = {
  movie: [
    { key: "popular", label: "Popular", fetch: getPopularMovies },
    { key: "top_rated", label: "Top Rated", fetch: getTopRatedMovies },
    { key: "upcoming", label: "Upcoming", fetch: getUpcomingMovies },
  ],
  tv: [
    { key: "popular", label: "Popular", fetch: getPopularTV },
    { key: "top_rated", label: "Top Rated", fetch: getTopRatedTV },
  ],
}

export default function Browse({ mediaType }) {
  const [params, setParams] = useSearchParams()
  const sortKey = params.get("sort") || "popular"
  const genreId = params.get("genre")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])

  const { data: genres } = useTMDB(() => getGenres(mediaType), [mediaType])
  const sortOption = SORTS[mediaType].find((s) => s.key === sortKey) || SORTS[mediaType][0]

  // Route-driven reset (switching /movies <-> /tv)
  useEffect(() => {
    setItems([])
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType])

  const changeSort = (key) => {
    setItems([])
    setPage(1)
    setParams(genreId ? { sort: key, genre: genreId } : { sort: key })
  }

  const changeGenre = (id) => {
    setItems([])
    setPage(1)
    setParams({ sort: sortKey, genre: String(id) })
  }

  const { data, loading } = useTMDB(
    () => (genreId ? discoverByGenre(mediaType, genreId, page) : sortOption.fetch(page)),
    [mediaType, sortKey, genreId, page],
  )

  useEffect(() => {
    if (data) setItems((prev) => (page === 1 ? data : [...prev, ...data]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-ink">{mediaType === "tv" ? "TV Shows" : "Movies"}</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {SORTS[mediaType].map((s) => (
          <button
            key={s.key}
            onClick={() => changeSort(s.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              sortKey === s.key && !genreId
                ? "bg-brand-purple border-brand-purple text-white"
                : "border-bg-border text-ink/60 hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
        {genres?.map((g) => (
          <button
            key={g.id}
            onClick={() => changeGenre(g.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              String(genreId) === String(g.id)
                ? "bg-brand-green/80 border-brand-green text-white"
                : "border-bg-border text-ink/60 hover:text-ink"
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item, i) => (
          <PosterCard key={`${item.id}-${i}`} item={{ ...item, media_type: mediaType }} />
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => <PosterSkeleton key={`s${i}`} />)}
      </div>

      {!loading && items.length === 0 && <p className="text-ink/40 text-center py-12">No titles found.</p>}

      {!loading && items.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="bg-bg-surface2 border border-bg-border text-ink hover:bg-bg-surface px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/Browse.jsx"

mkdir -p "src/pages"
cat > "src/pages/MyList.jsx" << 'FH_UPDATE_EOF_MARKER'
import { Bookmark } from "lucide-react"
import { useMyList } from "../hooks/useMyList"
import PosterCard from "../components/PosterCard"

export default function MyList() {
  const { list } = useMyList()

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-ink">My List</h1>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink/40">
          <Bookmark className="w-10 h-10" />
          <p>Titles you save will show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {list.map((item) => (
            <PosterCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/MyList.jsx"

mkdir -p "src/pages"
cat > "src/pages/Search.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search as SearchIcon, X, Clock } from "lucide-react"
import { useTMDB } from "../hooks/useTMDB"
import { useDebounce } from "../hooks/useDebounce"
import { searchMulti } from "../lib/tmdb"
import { useRecentSearches } from "../hooks/useRecentSearches"
import PosterCard from "../components/PosterCard"
import { PosterSkeleton } from "../components/Skeletons"

const FILTERS = [
  { key: "all", label: "All" },
  { key: "movie", label: "Movies" },
  { key: "tv", label: "TV Shows" },
]

export default function Search() {
  const [params, setParams] = useSearchParams()
  const input = params.get("q") || ""
  const filter = params.get("type") || "all"
  const debounced = useDebounce(input, 400)
  const { terms, addTerm, clearTerms } = useRecentSearches()

  const { data, loading } = useTMDB(() => searchMulti(debounced, 1, filter), [debounced, filter])

  useEffect(() => {
    if (debounced.trim().length > 1) {
      const t = setTimeout(() => addTerm(debounced), 1200) // only log after they pause typing
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const onChange = (e) => {
    const q = e.target.value
    setParams(q ? { q, type: filter } : {})
  }

  const runTerm = (term) => setParams({ q: term, type: filter })
  const setFilter = (key) => setParams(input ? { q: input, type: key } : {})

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <div className="relative max-w-xl mb-4">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40" />
        <input
          autoFocus
          value={input}
          onChange={onChange}
          placeholder="Search movies & TV shows..."
          aria-label="Search movies and TV shows"
          className="w-full bg-bg-surface border border-bg-border focus:border-brand-purple/60 rounded-full py-3 pl-12 pr-11 outline-none transition-colors text-lg text-ink placeholder:text-ink/40"
        />
        {input && (
          <button
            onClick={() => setParams({})}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f.key ? "bg-brand-purple border-brand-purple text-white" : "border-bg-border text-ink/60 hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!input && terms.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink/60 uppercase tracking-wide">Recent Searches</h2>
            <button onClick={clearTerms} className="text-xs text-ink/40 hover:text-ink/70">
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {terms.map((term) => (
              <button
                key={term}
                onClick={() => runTerm(term)}
                className="flex items-center gap-1.5 bg-bg-surface2 border border-bg-border text-ink/70 hover:text-ink hover:border-brand-purple/40 rounded-full px-3 py-1.5 text-sm transition-colors"
              >
                <Clock className="w-3.5 h-3.5" /> {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <PosterSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && debounced && data?.length === 0 && (
        <p className="text-ink/40 text-center py-12">No results for "{debounced}" — try checking the spelling.</p>
      )}

      {!loading && data?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.map((item) => (
            <PosterCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      {!input && terms.length === 0 && (
        <p className="text-ink/30 text-center py-12">Start typing to search Fountain Home's catalog.</p>
      )}
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/Search.jsx"

mkdir -p "src/pages"
cat > "src/pages/Settings.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Check, MonitorPlay, Palette, PlayCircle, ShieldCheck } from "lucide-react"
import { DEFAULT_VIDEO_SOURCE, getVideoSources } from "../config/videoSource"
import { useSettings } from "../hooks/useSettings"
import ThemeToggle from "../components/ThemeToggle"

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-purple/15 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="text-sm text-ink/50">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 py-2 text-left"
    >
      <div>
        <p className="font-medium text-ink">{label}</p>
        {hint && <p className="text-xs text-ink/50 mt-0.5">{hint}</p>}
      </div>
      <span
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-brand-purple" : "bg-bg-border"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  )
}

export default function Settings() {
  const sources = getVideoSources()
  const { settings, update } = useSettings()

  const [selectedSource, setSelectedSource] = useState(() => {
    try {
      return localStorage.getItem("fountain-home-video-source") || DEFAULT_VIDEO_SOURCE
    } catch {
      return DEFAULT_VIDEO_SOURCE
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("fountain-home-video-source", selectedSource)
    } catch {
      // Ignore unavailable storage.
    }
  }, [selectedSource])

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-ink/60 hover:text-ink text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-ink">Settings</h1>
          <p className="text-ink/50 mt-2">Configure your Fountain Home preferences.</p>
        </div>

        <SettingsSection icon={Palette} title="Appearance" description="Choose how Fountain Home looks.">
          <ThemeToggle variant="full" />
        </SettingsSection>

        <SettingsSection icon={PlayCircle} title="Playback" description="Preferences for watching on this device.">
          <ToggleRow
            label="Autoplay next episode"
            hint="Automatically starts the next episode when one finishes."
            checked={settings.autoplayNext}
            onChange={(v) => update({ autoplayNext: v })}
          />
        </SettingsSection>

        <SettingsSection icon={ShieldCheck} title="Content" description="Control what shows up while browsing.">
          <ToggleRow
            label="Hide adult content"
            hint="Filters adult titles out of search and browse results."
            checked={settings.adultFilter}
            onChange={(v) => update({ adultFilter: v })}
          />
        </SettingsSection>

        {/* --- Existing Video Source section, unchanged --- */}
        <section className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-bg-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-purple/15 flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-brand-purple" />
              </div>

              <div>
                <h2 className="font-semibold">Video Source</h2>

                <p className="text-sm text-white/50">Choose the player used when you start watching.</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {sources.map((source) => {
              const active = selectedSource === source.id

              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSource(source.id)}
                  className={`w-full flex items-center justify-between gap-4 p-4 rounded-lg border text-left transition-colors ${
                    active ? "border-brand-purple bg-brand-purple/10" : "border-bg-border bg-bg-surface2 hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">{source.name}</p>

                    {source.id === DEFAULT_VIDEO_SOURCE && <p className="text-xs text-brand-purple mt-1">Default source</p>}
                  </div>

                  {active && <Check className="w-5 h-5 text-brand-purple shrink-0" />}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/Settings.jsx"

mkdir -p "src/pages"
cat > "src/pages/Watch.jsx" << 'FH_UPDATE_EOF_MARKER'
import { useEffect, useRef, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Film, Youtube, X } from "lucide-react"
import { useTMDB } from "../hooks/useTMDB"
import { getDetails, getTrailerKey } from "../lib/tmdb"
import { backdropUrl } from "../config/tmdb"
import { DEFAULT_VIDEO_SOURCE, getVideoSource } from "../config/videoSource"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"
import { useContinueWatching } from "../hooks/useContinueWatching"
import { useSettings } from "../hooks/useSettings"
import { useRedirectGuard } from "../hooks/useRedirectGuard"
import ImageWithFallback from "../components/ImageWithFallback"
import EpisodeSelector from "../components/EpisodeSelector"

function getNextEpisode(seasons, currentSeason, currentEpisode) {
  const validSeasons = (seasons || []).filter((s) => s.season_number > 0).sort((a, b) => a.season_number - b.season_number)
  const sIdx = validSeasons.findIndex((s) => s.season_number === Number(currentSeason))
  if (sIdx === -1) return null
  const season = validSeasons[sIdx]
  if (Number(currentEpisode) < season.episode_count) {
    return { season: season.season_number, episode: Number(currentEpisode) + 1 }
  }
  const nextSeason = validSeasons[sIdx + 1]
  return nextSeason ? { season: nextSeason.season_number, episode: 1 } : null
}

export default function Watch() {
  const { mediaType, id, season, episode } = useParams()
  const navigate = useNavigate()
  const { data, loading } = useTMDB(() => getDetails(mediaType, id), [mediaType, id])
  const { addView } = useRecentlyViewed()
  const { getProgress, saveProgress, removeProgress } = useContinueWatching()
  const { settings } = useSettings()
  const videoRef = useRef(null)
  const lastSaveRef = useRef(0)
  const [upNext, setUpNext] = useState(null) // { season, episode, secondsLeft } while counting down

  // Protects the app from provider redirect/popup attempts while watching.
  useRedirectGuard(true)

  // The source picker itself lives in Settings now — this just reads
  // whichever source is currently selected there.
  const selectedSource = (() => {
    try {
      return localStorage.getItem("fountain-home-video-source") || DEFAULT_VIDEO_SOURCE
    } catch {
      return DEFAULT_VIDEO_SOURCE
    }
  })()
  const source = getVideoSource(mediaType, id, season, episode, selectedSource)

  useEffect(() => {
    if (data) {
      addView({ id: data.id, media_type: mediaType, title: data.title, name: data.name, poster_path: data.poster_path })
      document.title = `${data.title || data.name} — Fountain Home`
    }
    return () => {
      document.title = "Fountain Home"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // Resume from a saved position — only meaningful for a direct <video>
  // source; an iframe embed is cross-origin and exposes no playback state
  // to read or seek.
  const handleLoadedMetadata = () => {
    const v = videoRef.current
    if (!v) return
    const saved = getProgress(mediaType, id)
    const sameEpisode = mediaType === "movie" || (saved?.season === Number(season) && saved?.episode === Number(episode))
    if (saved && sameEpisode && saved.position > 5 && saved.position < saved.duration * 0.95) {
      v.currentTime = saved.position
    }
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const now = Date.now()
    if (now - lastSaveRef.current < 5000) return
    lastSaveRef.current = now
    saveProgress({
      id: data.id,
      mediaType,
      title: data.title,
      name: data.name,
      poster_path: data.poster_path,
      season: season ? Number(season) : undefined,
      episode: episode ? Number(episode) : undefined,
      position: v.currentTime,
      duration: v.duration,
    })
  }

  const handleEnded = () => {
    removeProgress(mediaType, id)
    if (mediaType !== "tv" || !data.seasons) return
    const next = getNextEpisode(data.seasons, season || 1, episode || 1)
    if (!next) return
    if (!settings.autoplayNext) {
      setUpNext({ ...next, secondsLeft: null }) // show a manual "play next" prompt only
      return
    }
    setUpNext({ ...next, secondsLeft: 5 })
  }

  useEffect(() => {
    if (!upNext || upNext.secondsLeft == null) return
    if (upNext.secondsLeft <= 0) {
      navigate(`/watch/tv/${id}/${upNext.season}/${upNext.episode}`)
      return
    }
    const t = setTimeout(() => setUpNext((u) => (u ? { ...u, secondsLeft: u.secondsLeft - 1 } : u)), 1000)
    return () => clearTimeout(t)
  }, [upNext, id, navigate])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Loading…</div>
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-ink/50">Title not found.</div>
  }

  const title = data.title || data.name
  const trailerKey = getTrailerKey(data)

  return (
    <div className="min-h-screen pt-16">
      <div className="px-4 md:px-8 py-4">
        <Link to={`/${mediaType}/${id}`} className="flex items-center gap-2 text-ink/60 hover:text-ink text-sm w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to details
        </Link>
      </div>

      <div className="px-4 md:px-8">
        <div className="mb-3 flex items-center gap-2 text-xs text-ink/45">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
          Redirect protection active
        </div>

        <div
          id="fountain-player"
          className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-bg-border"
        >
          {source?.type === "video" && (
            <video
              key={source.src}
              ref={videoRef}
              src={source.src}
              controls
              autoPlay
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              className="w-full h-full"
            />
          )}

          {source?.type === "iframe" && (
            <iframe
              key={`${selectedSource}-${mediaType}-${id}-${season || ""}-${episode || ""}`}
              src={source.src}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share; orientation-lock"
              allowFullScreen
              title={`${title} — ${source.name || "Video"}`}
              referrerPolicy="no-referrer"
            />
          )}

          {!source && (
            <div className="absolute inset-0">
              <ImageWithFallback
                src={backdropUrl(data.backdrop_path, "original")}
                alt={title}
                className="w-full h-full object-cover opacity-30 blur-sm"
                fallbackClassName="w-full h-full"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6 bg-black/50">
                <Film className="w-10 h-10 text-white/40" />
                <div>
                  <p className="font-semibold text-white/80">No video source connected</p>
                  <p className="text-sm text-white/50 max-w-md mt-1">
                    Pick a source in{" "}
                    <Link to="/settings" className="underline">
                      Settings
                    </Link>
                    .
                  </p>
                </div>
                {trailerKey && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailerKey}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-brand-red/90 hover:bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <Youtube className="w-4 h-4" /> Watch trailer instead
                  </a>
                )}
              </div>
            </div>
          )}

          {upNext && (
            <div className="absolute bottom-4 right-4 bg-bg-surface/95 backdrop-blur border border-bg-border rounded-xl p-4 max-w-xs shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink/50 uppercase tracking-wide">Up Next</p>
                  <p className="text-sm font-semibold text-ink mt-1">
                    Season {upNext.season}, Episode {upNext.episode}
                  </p>
                  {upNext.secondsLeft != null && (
                    <p className="text-xs text-ink/50 mt-1">Playing in {upNext.secondsLeft}s…</p>
                  )}
                </div>
                <button onClick={() => setUpNext(null)} className="text-ink/40 hover:text-ink shrink-0" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => navigate(`/watch/tv/${id}/${upNext.season}/${upNext.episode}`)}
                className="mt-3 w-full bg-brand-purple hover:bg-brand-purple-dark text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                Play Now
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-xl md:text-2xl font-bold text-ink">{title}</h1>
          {mediaType === "tv" && (
            <p className="text-ink/50 text-sm mt-1">
              Season {season || 1}, Episode {episode || 1}
            </p>
          )}
        </div>

        {mediaType === "tv" && data.seasons && (
          <div className="mt-6 mb-10">
            <EpisodeSelector seasons={data.seasons} tmdbId={id} currentSeason={season || 1} currentEpisode={episode || 1} />
          </div>
        )}
        {mediaType === "movie" && <div className="mb-10" />}
      </div>
    </div>
  )
}
FH_UPDATE_EOF_MARKER
echo "  updated: src/pages/Watch.jsx"

echo ""
echo "Done. 24 files updated."
echo "Review with: git status / git diff"
echo "Then:  git add -A && git commit -m \"theme, settings, continue watching, play next, light/dark mode, better search\" && git push"
