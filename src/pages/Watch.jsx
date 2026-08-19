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
