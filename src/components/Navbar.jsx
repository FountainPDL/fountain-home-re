import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Search, Menu, X, Settings as SettingsIcon } from "lucide-react"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const submitSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setMenuOpen(false)
    }
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-white ${isActive ? "text-white" : "text-white/60"}`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-bg/95 backdrop-blur-md border-b border-bg-border" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="./logo-mark.png" alt="" className="w-8 h-8 rounded-full" />
            <span className="font-extrabold text-lg tracking-tight text-white">
              Fountain <span className="text-gradient">Home</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/movies" className={linkClass}>
              Movies
            </NavLink>
            <NavLink to="/tv" className={linkClass}>
              TV Shows
            </NavLink>
            <NavLink to="/my-list" className={linkClass}>
              My List
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <form onSubmit={submitSearch} className="hidden sm:flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search titles..."
                aria-label="Search titles"
                className="w-40 md:w-64 bg-white/10 focus:bg-white/15 border border-white/10 focus:border-brand-purple/60 rounded-full py-2 pl-9 pr-4 text-sm outline-none transition-all text-white placeholder:text-white/40"
              />
            </div>
          </form>

          <ThemeToggle variant="icon" />

          <Link
            to="/settings"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Settings"
          >
            <SettingsIcon className="w-[18px] h-[18px]" />
          </Link>

          <button className="md:hidden text-white" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-bg border-t border-bg-border px-4 py-4 space-y-4">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search titles..."
              aria-label="Search titles"
              className="w-full bg-bg-surface2 border border-bg-border rounded-full py-2 pl-9 pr-4 text-sm outline-none text-ink placeholder:text-ink/40"
            />
          </form>
          <nav className="flex flex-col gap-3">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              Home
            </NavLink>
            <NavLink to="/movies" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              Movies
            </NavLink>
            <NavLink to="/tv" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              TV Shows
            </NavLink>
            <NavLink to="/my-list" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              My List
            </NavLink>
            <NavLink to="/settings" onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm font-medium flex items-center gap-2 ${isActive ? "text-brand-purple" : "text-ink/70"}`}>
              <SettingsIcon className="w-4 h-4" /> Settings
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  )
}
