export default function Footer() {
  return (
    <footer className="border-t border-bg-border mt-16 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink/40">
        <div className="flex items-center gap-2">
          <img src="./logo-mark.png" alt="" className="w-6 h-6 rounded-full" />
          <span className="font-semibold text-ink/70">Fountain Home</span>
        </div>
        <p className="text-center max-w-md">
          Movie & TV data provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-ink/70"
          >
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </footer>
  )
}
