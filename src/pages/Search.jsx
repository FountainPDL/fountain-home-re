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
