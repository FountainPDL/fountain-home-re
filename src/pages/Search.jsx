import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Search as SearchIcon } from "lucide-react"
import { useTMDB } from "../hooks/useTMDB"
import { useDebounce } from "../hooks/useDebounce"
import { searchMulti } from "../lib/tmdb"
import PosterCard from "../components/PosterCard"
import { PosterSkeleton } from "../components/Skeletons"

export default function Search() {
  const [params, setParams] = useSearchParams()
  const [input, setInput] = useState(params.get("q") || "")
  const debounced = useDebounce(input, 400)

  const { data, loading } = useTMDB(() => searchMulti(debounced), [debounced])

  const onChange = (e) => {
    setInput(e.target.value)
    setParams(e.target.value ? { q: e.target.value } : {})
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <div className="relative max-w-xl mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          autoFocus
          value={input}
          onChange={onChange}
          placeholder="Search movies & TV shows..."
          className="w-full bg-bg-surface border border-bg-border focus:border-brand-purple/60 rounded-full py-3 pl-12 pr-4 outline-none transition-colors text-lg"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <PosterSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && debounced && data?.length === 0 && (
        <p className="text-white/40 text-center py-12">No results for "{debounced}"</p>
      )}

      {!loading && data?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.map((item) => (
            <PosterCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      {!debounced && <p className="text-white/30 text-center py-12">Start typing to search Fountain Home's catalog.</p>}
    </div>
  )
}
