import { HashRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Browse from "./pages/Browse"
import Search from "./pages/Search"
import Details from "./pages/Details"
import Watch from "./pages/Watch"
import Settings from "./pages/Settings"
import MyList from "./pages/MyList"
import NotFound from "./pages/NotFound"
import ScrollToTop from "./components/ScrollToTop"

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Browse mediaType="movie" />} />
          <Route path="/tv" element={<Browse mediaType="tv" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/watch/:mediaType/:id" element={<Watch />} />
          <Route path="/watch/:mediaType/:id/:season/:episode" element={<Watch />} />
          <Route path="/:mediaType/:id" element={<Details />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </HashRouter>
  )
}
