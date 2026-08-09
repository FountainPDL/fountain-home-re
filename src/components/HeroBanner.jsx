import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react"
import ImageWithFallback from "./ImageWithFallback"
import { backdropUrl } from "../config/tmdb"
import { HeroSkeleton } from "./Skeletons"

export default function HeroBanner({ items, loading }) {
  const [index, setIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)

  const slides = (items || []).slice(0, 6)

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(t)
  }, [slides.length])

  if (loading) return <HeroSkeleton />
  if (!slides.length) return null

  const item = slides[index] || slides[0]
  const title = item.title || item.name
  const mediaType = item.media_type || (item.title ? "movie" : "tv")
  const overview = item.overview?.length > 220 ? item.overview.slice(0, 220) + "…" : item.overview

  const next = () => setIndex((i) => (i + 1) % slides.length)
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)

  return (
    <div
      className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden"
      onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
      onTouchEnd={(e) => {
        const delta = touchStart - e.changedTouches[0].clientX
        if (delta > 50) next()
        else if (delta < -50) prev()
      }}
    >
      <div className="absolute inset-0">
        <ImageWithFallback
          key={item.id}
          src={backdropUrl(item.backdrop_path, "original")}
          alt={title}
          className="w-full h-full object-cover animate-fade-in"
          fallbackClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/20 to-transparent" />
      </div>

      <div className="relative h-full flex items-end md:items-center px-4 md:px-8 pb-10 md:pb-0">
        <div className="max-w-xl space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-balance drop-shadow-lg">{title}</h1>
          <div className="flex items-center gap-3 flex-wrap text-sm">
            {item.vote_average > 0 && (
              <span className="flex items-center gap-1 bg-black/50 rounded-full px-2.5 py-1">
                <Star className="w-3.5 h-3.5 fill-brand-green text-brand-green" />
                {item.vote_average.toFixed(1)}
              </span>
            )}
            <span className="bg-black/50 rounded-full px-2.5 py-1">
              {(item.release_date || item.first_air_date || "").split("-")[0]}
            </span>
            <span className="uppercase text-xs tracking-wide bg-brand-purple/80 rounded-full px-2.5 py-1 font-semibold">
              {mediaType === "tv" ? "Series" : "Movie"}
            </span>
          </div>
          <p className="hidden sm:block text-white/70 text-sm md:text-base leading-relaxed line-clamp-3">{overview}</p>
          <div className="flex gap-3 pt-2">
            <Link
              to={`/watch/${mediaType}/${item.id}`}
              className="flex items-center gap-2 bg-white text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
            >
              <Play className="w-5 h-5 fill-black" /> Watch Now
            </Link>
            <Link
              to={`/${mediaType}/${item.id}`}
              className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white/25 transition-colors"
            >
              <Info className="w-5 h-5" /> More Info
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-brand-purple" : "w-1.5 bg-white/30"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
