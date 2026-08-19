import { Bookmark } from "lucide-react"
import { useMyList } from "../hooks/useMyList"
import PosterCard from "../components/PosterCard"

export default function MyList() {
  const { list } = useMyList()

  return (
    <div className="min-h-screen pt-24 px-4 md:px-8 pb-16">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-ink">My List</h1>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink/40">
          <Bookmark className="w-10 h-10" />
          <p>Titles you save will show up here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {list.map((item) => (
            <PosterCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
