import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"

export default function EpisodeSelector({ seasons, tmdbId, currentSeason, currentEpisode }) {
  const validSeasons = (seasons || []).filter((s) => s.season_number > 0)
  const [season, setSeason] = useState(Number(currentSeason) || validSeasons[0]?.season_number || 1)
  const navigate = useNavigate()

  const activeSeason = validSeasons.find((s) => s.season_number === season)
  const episodeCount = activeSeason?.episode_count || 0

  const goTo = (s, e) => navigate(`/watch/tv/${tmdbId}/${s}/${e}`)

  if (validSeasons.length === 0) return null

  return (
    <div className="bg-bg-surface border border-bg-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="font-semibold text-ink">Episodes</h3>
        <div className="relative">
          <select
            value={season}
            onChange={(e) => {
              const s = Number(e.target.value)
              setSeason(s)
              goTo(s, 1)
            }}
            className="appearance-none bg-bg-surface2 border border-bg-border text-ink rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:border-brand-purple/60"
          >
            {validSeasons.map((s) => (
              <option key={s.season_number} value={s.season_number}>
                {s.name || `Season ${s.season_number}`}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ink/50" />
        </div>
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
          <button
            key={ep}
            onClick={() => goTo(season, ep)}
            className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
              Number(currentSeason) === season && Number(currentEpisode) === ep
                ? "bg-brand-purple text-white"
                : "bg-bg-surface2 hover:bg-bg-border text-ink/70"
            }`}
          >
            {ep}
          </button>
        ))}
      </div>
    </div>
  )
}
