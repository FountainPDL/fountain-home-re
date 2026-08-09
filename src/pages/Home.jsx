import { useTMDB } from "../hooks/useTMDB"
import { getTrending, getPopularMovies, getPopularTV, getTopRatedMovies, getAnime, searchTVShow } from "../lib/tmdb"
import HeroBanner from "../components/HeroBanner"
import ContentRow from "../components/ContentRow"
import { useRecentlyViewed } from "../hooks/useRecentlyViewed"

export default function Home() {
  const trending = useTMDB(() => getTrending("week"), [])
  const popularMovies = useTMDB(() => getPopularMovies(), [])
  const popularTV = useTMDB(() => getPopularTV(), [])
  const topRated = useTMDB(() => getTopRatedMovies(), [])
  const anime = useTMDB(() => getAnime(), [])
  // Carried over from your v0 project's dedicated getPowerRangers() row —
  // swap the query below or delete this block to replace it.
  const powerRangers = useTMDB(() => searchTVShow("power rangers"), [])
  const { items: recent } = useRecentlyViewed()

  return (
    <div className="pb-16">
      <HeroBanner items={trending.data} loading={trending.loading} />

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
