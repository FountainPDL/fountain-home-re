import { useState, useEffect } from "react"
import { Clapperboard } from "lucide-react"

export default function ImageWithFallback({ src, alt = "", className = "", fallbackClassName = "" }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-bg-surface2 text-ink/15 ${fallbackClassName || className}`}>
        <Clapperboard className="w-1/4 h-1/4 min-w-6 min-h-6" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={className} />
  )
}
