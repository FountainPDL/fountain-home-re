/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: { DEFAULT: "#8A2BE2", light: "#C084FC", dark: "#5B21B6" },
          green: { DEFAULT: "#22C55E", light: "#4ADE80", dark: "#15803D" },
          red: { DEFAULT: "#E11D48", light: "#FB7185", dark: "#9F1239" },
        },
        bg: {
          DEFAULT: "rgb(var(--c-bg) / <alpha-value>)",
          surface: "rgb(var(--c-bg-surface) / <alpha-value>)",
          surface2: "rgb(var(--c-bg-surface2) / <alpha-value>)",
          border: "rgb(var(--c-bg-border) / <alpha-value>)",
        },
        ink: "rgb(var(--c-ink) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(90deg, #5B21B6 0%, #8A2BE2 50%, #C084FC 100%)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
}
