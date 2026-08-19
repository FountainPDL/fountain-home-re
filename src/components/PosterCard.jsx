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
