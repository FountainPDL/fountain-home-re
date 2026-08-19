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
