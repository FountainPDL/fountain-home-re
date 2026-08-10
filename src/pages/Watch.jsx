import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Film, Youtube, ChevronDown, Settings } from "lucide-react"
import { useTMDB } from "../hooks/useTMDB"
import { getDetails, getTrailerKey } from "../lib/tmdb"
import { backdropUrl } from "../config/tmdb"
import {
  DEFAULT_VIDEO_SOURCE,
  getVideoSource,
  getVideoSources,
} from "../config/videoSource"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"
import ImageWithFallback from "../components/ImageWithFallback"
import EpisodeSelector from "../components/EpisodeSelector"
import { useRedirectGuard } from "../hooks/useRedirectGuard"

export default function Watch() {
  const { mediaType, id, season, episode } = useParams()

  const { data, loading } = useTMDB(
    () => getDetails(mediaType, id),
    [mediaType, id]
  )

  const { addView } = useRecentlyViewed()

  // Protect the watch page from provider redirect attempts.
  useRedirectGuard(true)

  const [selectedSource, setSelectedSource] = useState(() => {
    try {
      return (
        localStorage.getItem("fountain-home-video-source") ||
        DEFAULT_VIDEO_SOURCE
      )
    } catch {
      return DEFAULT_VIDEO_SOURCE
    }
  })

  // Get sources before any conditional return.
  const sources = getVideoSources()

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

  useEffect(() => {
    try {
      localStorage.setItem(
        "fountain-home-video-source",
        selectedSource
      )
    } catch {
      // Ignore unavailable storage.
    }
  }, [selectedSource])

  // Automatically request landscape when fullscreen is entered.
  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (document.fullscreenElement) {
        try {
          if (screen.orientation?.lock) {
            await screen.orientation.lock("landscape")
          }
        } catch {
          // Orientation locking is browser dependent.
        }
      } else {
        try {
          if (screen.orientation?.unlock) {
            screen.orientation.unlock()
          }
        } catch {
          // Ignore unsupported browsers.
        }
      }
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    )

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      )
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        Loading…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        Title not found.
      </div>
    )
  }

  const title = data.title || data.name
  const trailerKey = getTrailerKey(data)

  const source = getVideoSource(
    mediaType,
    id,
    season,
    episode,
    selectedSource
  )

  const currentSource =
    sources.find((item) => item.id === selectedSource)

  const handleSourceChange = (event) => {
    const nextSource = event.target.value

    setSelectedSource(nextSource)

    try {
      localStorage.setItem(
        "fountain-home-video-source",
        nextSource
      )
    } catch {
      // Ignore unavailable storage.
    }
  }

  return (
    <div className="min-h-screen pt-16">

      <div className="px-4 md:px-8 py-4">
        <Link
          to={`/${mediaType}/${id}`}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to details
        </Link>
      </div>

      <div className="px-4 md:px-8">

        {/* REDIRECT PROTECTION + SOURCE SWITCHER */}
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-white/45">
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
            Redirect protection active
          </div>
        </div>

        {/* SOURCE SWITCHER */}
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              Streaming source
            </p>

            <p className="text-sm text-white/70 mt-1">
              {currentSource?.name || "Peachify"}
            </p>
          </div>

          <div className="relative">
            <select
              value={selectedSource}
              onChange={handleSourceChange}
              className="appearance-none min-w-[190px] bg-bg-surface2 border border-bg-border text-white rounded-lg pl-4 pr-10 py-2.5 text-sm outline-none focus:border-brand-purple transition-colors"
              aria-label="Select video source"
            >
              {sources.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
          </div>
        </div>

        {/* PLAYER */}
        <div
          id="fountain-player"
          className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-bg-border"
        >
          {source?.type === "video" && (
            <video
              key={source.src}
              src={source.src}
              controls
              autoPlay
              playsInline
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
              title={`${title} — ${currentSource?.name || "Video"}`}
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
                  <p className="font-semibold text-white/80">
                    No video source connected
                  </p>

                  <p className="text-sm text-white/50 max-w-md mt-1">
                    Select another source above.
                  </p>
                </div>

                {trailerKey && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailerKey}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-brand-red/90 hover:bg-brand-red text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    Watch trailer instead
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TITLE + SETTINGS */}
        <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              {title}
            </h1>

            {mediaType === "tv" && (
              <p className="text-white/50 text-sm mt-1">
                Season {season || 1}, Episode {episode || 1}
              </p>
            )}
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface2 border border-bg-border text-white/70 hover:text-white hover:border-brand-purple transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>

        {mediaType === "tv" && data.seasons && (
          <div className="mt-6 mb-10">
            <EpisodeSelector
              seasons={data.seasons}
              tmdbId={id}
              currentSeason={season || 1}
              currentEpisode={episode || 1}
            />
          </div>
        )}

        {mediaType === "movie" && (
          <div className="mb-10" />
        )}

      </div>
    </div>
  )
}
