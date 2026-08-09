import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

// Relative base so the built app works from a GitHub Pages subpath
// (https://<user>.github.io/<repo>/) without any extra config.
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "logo-mark.png"],
      manifest: {
        name: "Fountain Home",
        short_name: "Fountain Home",
        description: "Discover trending, popular, and top-rated movies & TV shows.",
        theme_color: "#0B0812",
        background_color: "#0B0812",
        display: "standalone",
        start_url: "./",
        icons: [
          { src: "logo-mark.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "app-icon-dark.png", sizes: "768x768", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // This is the "good caching" fix: posters/backdrops are cached first
        // (they never change once published), API responses use a short
        // network-first cache so lists stay fresh but repeat loads are instant.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "tmdb-images",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.themoviedb\.org\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "tmdb-api",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
