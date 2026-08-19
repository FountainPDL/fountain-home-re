import { useTMDB } from "../hooks/useTMDB"
import { getTrending, getPopularMovies, getPopularTV, getTopRatedMovies, getAnime, searchTVShow } from "../lib/tmdb"
import HeroBanner from "../components/HeroBanner"
import ContentRow from "../components/ContentRow"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"
import { useContinueWatching } from "../hooks/useContinueWatching"

export default function Home() {
  const trending = useTMDB(() => getTrending("week"), [])
  const popularMovies = useTMDB(() => getPopularMovies(), [])
  const popularTV = useTMDB(() => getPopularTV(), [])
  const topRated = useTMDB(() => getTopRatedMovies(), [])
  const anime = useTMDB(() => getAnime(), [])
  const powerRangers = useTMDB(() => searchTVShow("power rangers"), [])
  const { items: recent } = useRecentlyViewed()
  const { list: continueWatching, getProgress } = useContinueWatching()

  const continueWatchingItems = continueWatching.map((c) => ({
    id: c.id,
    media_type: c.mediaType,
    title: c.title,
    name: c.name,
    poster_path: c.poster_path,
  }))
  const progressFor = (item) => {
    const p = getProgress(item.media_type, item.id)
    return p?.duration ? (p.position / p.duration) * 100 : undefined
  }

  return (
    <div className="pb-16">
      <HeroBanner items={trending.data} loading={trending.loading} />

      {continueWatchingItems.length > 0 && (
        <ContentRow title="Continue Watching" items={continueWatchingItems} getProgress={progressFor} />
      )}

      {recent.length > 0 && <ContentRow title="Continue Browsing" items={recent} />}

      <ContentRow title="Trending This Week" items={trending.data} loading={trending.loading} error={trending.error} />
      <ContentRow title="Popular Movies" items={popularMovies.data} loading={popularMovies.loading} error={popularMovies.error} />
      <ContentRow title="Popular TV Shows" items={popularTV.data} loading={popularTV.loading} error={popularTV.error} />
      <ContentRow title="Top Rated Movies" items={topRated.data} loading={topRated.loading} error={topRated.error} />
      <ContentRow title="Anime" items={anime.data} loading={anime.loading} error={anime.error} />
      <ContentRow title="Power Rangers" items={powerRangers.data} loading={powerRangers.loading} error={powerRangers.error} />
    </div>
  )
}
