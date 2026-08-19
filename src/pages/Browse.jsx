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
