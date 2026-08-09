import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Film, Youtube, Maximize } from "lucide-react"
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
import SourceSelector from "../components/SourceSelector"
import RedirectBlocker from "../components/RedirectBlocker"

export default function Watch() {
  const { mediaType, id, season, episode } = useParams()
  const { data, loading } = useTMDB(
    () => getDetails(mediaType, id),
    [mediaType, id]
  )
  const { addView } = useRecentlyViewed()

  const [selectedSource, setSelectedSource] = useState(() => {
    try {
      return localStorage.getItem("fountain-home-video-source") ||
        DEFAULT_VIDEO_SOURCE
    } catch {
      return DEFAULT_VIDEO_SOURCE
    }
  })

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
      // Storage may be unavailable in private browsing.
    }
  }, [selectedSource])

  /*
   * When the player enters fullscreen, request landscape orientation.
   * Android browsers that support Screen Orientation API will rotate
   * automatically. Browsers that do not support it simply remain unchanged.
   */
  useEffect(() => {
    const handleFullscreenChange = async () => {
      if (document.fullscreenElement) {
        try {
          if (screen.orientation?.lock) {
            await screen.orientation.lock("landscape")
          }
        } catch {
          // Orientation locking is not supported by every browser.
        }
      } else {
        try {
          if (screen.orientation?.unlock) {
            screen.orientation.unlock()
          }
        } catch {
          // Ignore unsupported orientation APIs.
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

      try {
        if (screen.orientation?.unlock) {
          screen.orientation.unlock()
        }
      } catch {
        // Ignore unsupported orientation APIs.
      }
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

  const sources = useMemo(
    () => getVideoSources(),
    []
  )

  const source = getVideoSource(
    mediaType,
    id,
    season,
    episode,
    selectedSource
  )

  const currentSourceName =
    sources.find((item) => item.id === selectedSource)?.name ||
    "Peachify"

  const handleSourceChange = (sourceId) => {
    setSelectedSource(sourceId)
  }

  return (
    <div className="min-h-screen pt-16">
      <RedirectBlocker />

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
        <div
          id="fountain-player"
          className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-bg-border"
        >
          {source?.type === "video" && (
            <video
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
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
              allowFullScreen
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-same-origin allow-scripts"
              referrerPolicy="no-referrer"
              title={`${title} — ${currentSourceName}`}
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
                    No video source connected yet
                  </p>

                  <p className="text-sm text-white/50 max-w-md mt-1">
                    The player is wired up and ready — add a source you
                    have the rights to in{" "}
                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">
                      src/config/videoSource.js
                    </code>
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
                    <Youtube className="w-4 h-4" />
                    Watch trailer instead
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

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

          <div className="flex items-center gap-2">
            <SourceSelector
              sources={sources}
              selected={selectedSource}
              onChange={handleSourceChange}
            />
          </div>
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
