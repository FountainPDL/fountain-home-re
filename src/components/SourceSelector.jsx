import { ChevronDown, Server } from "lucide-react"

export default function SourceSelector({ sources, selected, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Server className="w-4 h-4 text-white/50 shrink-0" />

      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-bg-surface2 border border-bg-border rounded-lg pl-3 pr-8 py-2 text-sm text-white outline-none focus:border-brand-purple/60 cursor-pointer"
          aria-label="Video source"
        >
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
      </div>
    </div>
  )
}
