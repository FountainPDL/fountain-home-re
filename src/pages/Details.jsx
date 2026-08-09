import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Play, Plus, Check, Star, Clock, Calendar, Film } from "lucide-react"
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Loading…</div>
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white/50 px-4 text-center">
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
            <h1 className="text-2xl md:text-4xl font-extrabold text-balance">{title}</h1>
            {data.tagline && <p className="text-white/50 italic">{data.tagline}</p>}

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5 text-sm">
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
                <span className="bg-brand-red/80 rounded-full px-3 py-1 font-semibold">{certification}</span>
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

            <p className="text-white/70 leading-relaxed max-w-2xl mx-auto md:mx-0">{data.overview}</p>

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
                  className="flex items-center gap-2 bg-bg-surface2 border border-bg-border font-semibold px-5 py-2.5 rounded-lg hover:bg-bg-surface transition-colors"
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
                className="flex items-center gap-2 bg-bg-surface2 border border-bg-border font-semibold px-5 py-2.5 rounded-lg hover:bg-bg-surface transition-colors"
              >
                {inList ? <Check className="w-5 h-5 text-brand-green" /> : <Plus className="w-5 h-5" />}
                {inList ? "In My List" : "My List"}
              </button>
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Cast</h2>
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
                  <p className="text-xs font-medium mt-2 line-clamp-1">{person.name}</p>
                  <p className="text-xs text-white/40 line-clamp-1">{person.character}</p>
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
