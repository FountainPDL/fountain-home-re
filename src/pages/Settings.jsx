import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Check, MonitorPlay } from "lucide-react"
import {
  DEFAULT_VIDEO_SOURCE,
  getVideoSources,
} from "../config/videoSource"

export default function Settings() {
  const sources = getVideoSources()

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

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Settings
          </h1>

          <p className="text-white/50 mt-2">
            Configure your Fountain Home playback preferences.
          </p>
        </div>

        <section className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">

          <div className="p-5 border-b border-bg-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-purple/15 flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-brand-purple" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Video Source
                </h2>

                <p className="text-sm text-white/50">
                  Choose the player used when you start watching.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {sources.map((source) => {
              const active = selectedSource === source.id

              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSource(source.id)}
                  className={`w-full flex items-center justify-between gap-4 p-4 rounded-lg border text-left transition-colors ${
                    active
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-bg-border bg-bg-surface2 hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">
                      {source.name}
                    </p>

                    {source.id === DEFAULT_VIDEO_SOURCE && (
                      <p className="text-xs text-brand-purple mt-1">
                        Default source
                      </p>
                    )}
                  </div>

                  {active && (
                    <Check className="w-5 h-5 text-brand-purple shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

        </section>

      </div>
    </div>
  )
}
