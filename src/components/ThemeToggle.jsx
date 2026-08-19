import { Sun, Moon } from "lucide-react"
import { useTheme } from "../hooks/useTheme"

/** variant="icon" for a compact navbar button, "full" for a labeled settings row. */
export default function ThemeToggle({ variant = "icon" }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-bg-surface2 border border-bg-border rounded-lg p-1">
      <button
        onClick={() => isDark || toggleTheme()}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
          isDark ? "bg-brand-purple text-white" : "text-ink/60 hover:text-ink"
        }`}
      >
        <Moon className="w-4 h-4" /> Dark
      </button>
      <button
        onClick={() => isDark && toggleTheme()}
        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
          !isDark ? "bg-brand-purple text-white" : "text-ink/60 hover:text-ink"
        }`}
      >
        <Sun className="w-4 h-4" /> Light
      </button>
    </div>
  )
}
