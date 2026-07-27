import { Link, Route, Routes } from "react-router";

import Home from "./pages/Home";
import Compress from "./pages/Compress";
import Resize from "./pages/Resize";
import Convert from "./pages/Convert";

export default function App() {
  return (
    <div className="min-h-screen bg-[#fff8ec] text-[#24202c]">
      <header className="border-b-2 border-[#24202c] bg-[#ffd84d]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="font-logo inline-block origin-left text-2xl transition-transform duration-300 ease-out hover:scale-x-50 hover:scale-y-75 motion-reduce:transform-none"
              >
            Shrinko
          </Link>

          <div className="flex gap-2 text-sm font-semibold sm:gap-4">
            <Link
              to="/compress"
              className="rounded-full px-3 py-2 transition hover:bg-[#ff735c]"
            >
              Compress
            </Link>

            <Link
              to="/resize"
              className="rounded-full px-3 py-2 transition hover:bg-[#9de3c2]"
            >
              Resize
            </Link>

            <Link
              to="/convert"
              className="rounded-full px-3 py-2 transition hover:bg-[#5267ff] hover:text-white"
            >
              Convert
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compress" element={<Compress />} />
          <Route path="/resize" element={<Resize />} />
          <Route path="/convert" element={<Convert />} />
        </Routes>
      </main>
    </div>
  );
}