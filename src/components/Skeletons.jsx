export function PosterSkeleton() {
  return (
    <div className="w-full">
      <div className="aspect-[2/3] rounded-lg bg-bg-surface2 animate-pulse" />
      <div className="mt-2 h-3 w-3/4 rounded bg-bg-surface2 animate-pulse" />
      <div className="mt-1.5 h-2.5 w-1/3 rounded bg-bg-surface2 animate-pulse" />
    </div>
  )
}

export function RowSkeleton({ count = 6 }) {
  return (
    <div className="flex gap-3 overflow-hidden px-4 md:px-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[140px] sm:w-[170px] md:w-[190px]">
          <PosterSkeleton />
        </div>
      ))}
    </div>
  )
}

export function HeroSkeleton() {
  return <div className="w-full h-[55vh] md:h-[70vh] bg-bg-surface animate-pulse" />
}
