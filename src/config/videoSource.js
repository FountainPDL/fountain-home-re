const SOURCES = {
  peachify: {
    id: "peachify",
    name: "Peachify",
    movie: (id) =>
      `https://peachify.pro/embed/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://peachify.pro/embed/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidlink: {
    id: "vidlink",
    name: "VidLink",
    movie: (id) =>
      `https://vidlink.pro/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://vidlink.pro/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidsrc: {
    id: "vidsrc",
    name: "Vidsrc",
    movie: (id) =>
      `https://vidsrc.sbs/embed/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://vidsrc.sbs/embed/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  superflixapi: {
    id: "superflixapi",
    name: "SuperFlixAPI",
    movie: (id) =>
      `https://superflixapi.pro/filme/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://superflixapi.pro/serie/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  movies111: {
    id: "movies111",
    name: "111Movies",
    movie: (id) =>
      `https://111movies.net/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://111movies.net/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidrock: {
    id: "vidrock",
    name: "VidRock",
    movie: (id) =>
      `https://vidrock.ru/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://vidrock.ru/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  videasy: {
    id: "videasy",
    name: "Videasy",
    movie: (id) =>
      `https://player.videasy.net/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://player.videasy.net/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidfast: {
    id: "vidfast",
    name: "VidFast",
    movie: (id) =>
      `https://vidfast.pro/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://vidfast.pro/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidking: {
    id: "vidking",
    name: "VidKing",
    movie: (id) =>
      `https://www.vidking.net/embed/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://www.vidking.net/embed/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidnest: {
    id: "vidnest",
    name: "VidNest",
    movie: (id) =>
      `https://vidnest.fun/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://vidnest.fun/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  superembed: {
    id: "superembed",
    name: "SuperEmbed",
    movie: (id) =>
      `https://multiembed.mov/?video_id=${encodeURIComponent(id)}&tmdb=1`,
    tv: (id, season, episode) =>
      `https://multiembed.mov/?video_id=${encodeURIComponent(id)}&tmdb=1&s=${encodeURIComponent(season)}&e=${encodeURIComponent(episode)}`,
  },

  twoembed: {
    id: "twoembed",
    name: "2Embed",
    movie: (id) =>
      `https://www.2embed.online/embed/movie/${encodeURIComponent(id)}`,
    tv: (id, season, episode) =>
      `https://www.2embed.online/embed/tv/${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },
}

export const DEFAULT_VIDEO_SOURCE = "peachify"

export const VIDEO_SOURCES = SOURCES

export function getVideoSources() {
  return Object.values(SOURCES).map((source) => ({
    id: source.id,
    name: source.name,
  }))
}

export function getVideoSource(
  mediaType,
  tmdbId,
  season,
  episode,
  sourceName = DEFAULT_VIDEO_SOURCE
) {
  const source = SOURCES[sourceName] || SOURCES[DEFAULT_VIDEO_SOURCE]

  if (!source || !tmdbId) {
    return null
  }

  let src = null

  if (mediaType === "movie") {
    src = source.movie(tmdbId)
  } else if (
    mediaType === "tv" &&
    season !== undefined &&
    episode !== undefined
  ) {
    src = source.tv(tmdbId, season, episode)
  }

  if (!src) {
    return null
  }

  return {
    type: "iframe",
    src,
    source: source.id,
    name: source.name,
  }
}
