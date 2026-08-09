import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-extrabold text-gradient">404</h1>
      <p className="text-white/50">This page doesn't exist.</p>
      <Link
        to="/"
        className="bg-brand-purple hover:bg-brand-purple-dark px-5 py-2.5 rounded-lg font-semibold transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
