import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Check, MonitorPlay, Palette, PlayCircle, ShieldCheck } from "lucide-react"
import { DEFAULT_VIDEO_SOURCE, getVideoSources } from "../config/videoSource"
import { useSettings } from "../hooks/useSettings"
import ThemeToggle from "../components/ThemeToggle"

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
      <div className="p-5 border-b border-bg-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-purple/15 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="text-sm text-ink/50">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 py-2 text-left"
    >
      <div>
        <p className="font-medium text-ink">{label}</p>
        {hint && <p className="text-xs text-ink/50 mt-0.5">{hint}</p>}
      </div>
      <span
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${checked ? "bg-brand-purple" : "bg-bg-border"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  )
}

export default function Settings() {
  const sources = getVideoSources()
  const { settings, update } = useSettings()

  const [selectedSource, setSelectedSource] = useState(() => {
    try {
      return localStorage.getItem("fountain-home-video-source") || DEFAULT_VIDEO_SOURCE
    } catch {
      return DEFAULT_VIDEO_SOURCE
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("fountain-home-video-source", selectedSource)
    } catch {
      // Ignore unavailable storage.
    }
  }, [selectedSource])

  return (
    <div className="min-h-screen pt-20 px-4 md:px-8 pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-ink/60 hover:text-ink text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-ink">Settings</h1>
          <p className="text-ink/50 mt-2">Configure your Fountain Home preferences.</p>
        </div>

        <SettingsSection icon={Palette} title="Appearance" description="Choose how Fountain Home looks.">
          <ThemeToggle variant="full" />
        </SettingsSection>

        <SettingsSection icon={PlayCircle} title="Playback" description="Preferences for watching on this device.">
          <ToggleRow
            label="Autoplay next episode"
            hint="Automatically starts the next episode when one finishes."
            checked={settings.autoplayNext}
            onChange={(v) => update({ autoplayNext: v })}
          />
        </SettingsSection>

        <SettingsSection icon={ShieldCheck} title="Content" description="Control what shows up while browsing.">
          <ToggleRow
            label="Hide adult content"
            hint="Filters adult titles out of search and browse results."
            checked={settings.adultFilter}
            onChange={(v) => update({ adultFilter: v })}
          />
        </SettingsSection>

        {/* --- Existing Video Source section, unchanged --- */}
        <section className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-bg-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-purple/15 flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-brand-purple" />
              </div>

              <div>
                <h2 className="font-semibold">Video Source</h2>

                <p className="text-sm text-white/50">Choose the player used when you start watching.</p>
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
                    active ? "border-brand-purple bg-brand-purple/10" : "border-bg-border bg-bg-surface2 hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">{source.name}</p>

                    {source.id === DEFAULT_VIDEO_SOURCE && <p className="text-xs text-brand-purple mt-1">Default source</p>}
                  </div>

                  {active && <Check className="w-5 h-5 text-brand-purple shrink-0" />}
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
