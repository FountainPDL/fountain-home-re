/**
 * Fountain Home — video sources
 * ------------------------------
 * Centralized video-source configuration.
 *
 * IMPORTANT:
 * This is the only source/config file that should be modified when
 * changing video providers.
 */

const SOURCES = {
  // DEFAULT SOURCE
  vidlink: {
    name: "VidLink",
    movie: (tmdbId) =>
      `https://vidlink.pro/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://vidlink.pro/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidsrc: {
    name: "Vidsrc",
    movie: (tmdbId) =>
      `https://vidsrc.sbs/embed/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://vidsrc.sbs/embed/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  peachify: {
    name: "Peachify",
    movie: (tmdbId) =>
      `https://peachify.pro/embed/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://peachify.pro/embed/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  superflixapi: {
    name: "SuperFlixAPI",
    movie: (tmdbId) =>
      `https://superflixapi.pro/filme/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://superflixapi.pro/serie/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  movies111: {
    name: "111Movies",
    movie: (tmdbId) =>
      `https://111movies.net/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://111movies.net/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidrock: {
    name: "VidRock",
    movie: (tmdbId) =>
      `https://vidrock.ru/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://vidrock.ru/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  videasy: {
    name: "Videasy",
    movie: (tmdbId) =>
      `https://player.videasy.net/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://player.videasy.net/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidfast: {
    name: "VidFast",
    movie: (tmdbId) =>
      `https://vidfast.pro/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://vidfast.pro/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidking: {
    name: "VidKing",
    movie: (tmdbId) =>
      `https://www.vidking.net/embed/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://www.vidking.net/embed/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  vidnest: {
    name: "VidNest",
    movie: (tmdbId) =>
      `https://vidnest.fun/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://vidnest.fun/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },

  superembed: {
    name: "SuperEmbed",
    movie: (tmdbId) =>
      `https://multiembed.mov/?video_id=${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://multiembed.mov/?video_id=${encodeURIComponent(tmdbId)}&s=${encodeURIComponent(season)}&e=${encodeURIComponent(episode)}`,
  },

  twoembed: {
    name: "2Embed",
    movie: (tmdbId) =>
      `https://www.2embed.online/embed/movie/${encodeURIComponent(tmdbId)}`,
    tv: (tmdbId, season, episode) =>
      `https://www.2embed.online/embed/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}`,
  },
};

// VidLink is the default server.
export const DEFAULT_VIDEO_SOURCE = "vidlink";

// All available sources, useful for a source selector/fallback system.
export const VIDEO_SOURCES = SOURCES;

/**
 * Get the URL for a specific source.
 *
 * @param {string} sourceName
 * @param {"movie"|"tv"} mediaType
 * @param {string|number} tmdbId
 * @param {string|number} [season]
 * @param {string|number} [episode]
 * @returns {{ type: "iframe", src: string, source: string, name: string } | null}
 */
export function getVideoSourceByName(
  sourceName,
  mediaType,
  tmdbId,
  season,
  episode
) {
  const source = SOURCES[sourceName];

  if (!source || !tmdbId) {
    return null;
  }

  let src = null;

  if (mediaType === "movie") {
    src = source.movie(tmdbId);
  } else if (
    mediaType === "tv" &&
    season !== undefined &&
    season !== null &&
    episode !== undefined &&
    episode !== null
  ) {
    src = source.tv(tmdbId, season, episode);
  }

  if (!src) {
    return null;
  }

  return {
    type: "iframe",
    src,
    source: sourceName,
    name: source.name,
  };
}

/**
 * Existing Fountain Home API.
 *
 * Uses VidLink automatically because VidLink is the default source.
 *
 * @param {"movie"|"tv"} mediaType
 * @param {string|number} tmdbId
 * @param {string|number} [season]
 * @param {string|number} [episode]
 * @returns {{ type: "iframe", src: string, source: string, name: string } | null}
 */
export function getVideoSource(
  mediaType,
  tmdbId,
  season,
  episode
) {
  return getVideoSourceByName(
    DEFAULT_VIDEO_SOURCE,
    mediaType,
    tmdbId,
    season,
    episode
  );
}

/**
 * Get every configured source for the same media.
 *
 * @param {"movie"|"tv"} mediaType
 * @param {string|number} tmdbId
 * @param {string|number} [season]
 * @param {string|number} [episode]
 * @returns {Array<{type:"iframe",src:string,source:string,name:string}>}
 */
export function getAllVideoSources(
  mediaType,
  tmdbId,
  season,
  episode
) {
  return Object.keys(SOURCES)
    .map((sourceName) =>
      getVideoSourceByName(
        sourceName,
        mediaType,
        tmdbId,
        season,
        episode
      )
    )
    .filter(Boolean);
}


/**
 * Get all configured video sources.
 * Alias used by the Watch page source selector.
 */
export function getVideoSources() {
  return Object.entries(SOURCES).map(([id, source]) => ({
    id,
    name: source.name,
  }))
}
