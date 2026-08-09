# Fountain Home

A Netflix-style movie & TV **discovery** site — trending/popular/top-rated rows, search, genre filters, full details pages (cast, trailer, similar titles), a watch-page shell, and a local "My List" — built with React + Vite + Tailwind, powered by TMDB.

## What's here, and what isn't

This is a discovery/browsing app, not a streaming backend. It uses TMDB for metadata (posters, overviews, cast, trailers) the way TMDB's API is meant to be used.

It does **not** include the vidsrc-style embed integration or the download feature from the original brief. Wiring those up pulls unlicensed copies of copyrighted movies and shows — that's piracy, and it's also a direct violation of TMDB's own API terms. See `src/config/videoSource.js` — that's the one clearly-marked spot to plug in a video source you actually have the rights to (self-hosted files, a licensed catalog API, your own recordings). Until then, the Watch page shows a clean "no source connected" state with a link to the official trailer instead of a broken player.

## Stack

- React 18 + Vite — static build, no server required
- React Router (`HashRouter`) — works on GitHub Pages with zero server config
- Tailwind CSS — purple/red/green theme pulled from your logo and the reference repo's design tokens
- `vite-plugin-pwa` — caches posters/backdrops and API responses so repeat visits are fast and some browsing works offline
- TMDB API for all movie/TV data

## Why this should feel faster than the old version

- Every TMDB response is cached (memory + `localStorage`, with a TTL), and duplicate simultaneous requests are merged into one network call.
- The details page fires **one** TMDB request (`append_to_response=videos,credits,similar,release_dates,content_ratings`) instead of four separate ones.
- A service worker caches poster/backdrop images (`CacheFirst`) and API responses (`NetworkFirst`, short TTL) at the network level — near-instant on repeat visits.
- Images lazy-load and always fall back to a clean placeholder instead of a broken-image icon if a poster is missing or fails to load. That's the direct fix for the broken posters — the likely original cause was `next/image` needing extra config for external hosts, or the shared demo TMDB key getting rate-limited under load; this version sidesteps both by using plain `<img>` with defensive fallbacks and its own request cache.

## Working from Termux — no local build needed

You never need to run `npm install` or `npm run build` on your phone. Edit files in ACode, then from Termux:

```bash
git add -A
git commit -m "update"
git push
```

GitHub Actions takes it from there: installs dependencies, builds, and deploys to GitHub Pages automatically — the same shape as your Android builds producing an APK artifact, just ending in a live URL instead of a downloadable file.

### One-time setup after pushing this to GitHub

1. **Settings → Pages → Source → GitHub Actions.**
2. *(Optional but recommended)* **Settings → Secrets and variables → Actions → New repository secret** — name it `TMDB_API_KEY`, value your own free key from https://www.themoviedb.org/settings/api. Skip this and the app falls back to the shared demo key already in the code, which works but can get rate-limited since it's reused across a lot of tutorial projects.
3. Push to `main`. Watch the **Actions** tab for build progress — the site goes live at `https://<your-username>.github.io/<repo-name>/` a minute or two after a successful run.

## Project layout

```
src/
  config/tmdb.js         TMDB base URLs + image URL helpers (null-safe)
  config/videoSource.js  <- your video source goes here
  lib/cache.js           memory + localStorage cache with TTL
  lib/tmdbClient.js      fetch wrapper: caching + de-duplicated requests
  lib/tmdb.js            all TMDB API calls (trending, search, details, etc.)
  hooks/                 useTMDB, useDebounce, useMyList, useRecentlyViewed
  components/            Navbar, HeroBanner, ContentRow, PosterCard, EpisodeSelector, etc.
  pages/                 Home, Browse, Search, Details, Watch, MyList, NotFound
```

## Customizing

- Home page rows are listed directly in `src/pages/Home.jsx` — add, remove, or reorder `<ContentRow>` entries freely. The "Power Rangers" row is carried over from your v0 project's `getPowerRangers()` as an example of a custom search-based row; swap the query or delete the block.
- Colors live in `tailwind.config.js` under `brand` (purple/red/green) and `bg` (surface shades).
- Logo files are in `public/` — `logo-mark.png` (the leaf icon) is used in the navbar/footer/favicon/PWA icon; `app-icon-dark.png` (the full lockup) is used for the Apple touch icon and social preview image. Swap any of them any time.

## Local development (optional)

Only relevant if you ever work from a machine with Node — not needed for your Termux workflow, since GitHub Actions handles building.

```bash
npm install
npm run dev
```
