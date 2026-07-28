import { Link, Route, Routes } from "react-router";

import Home from "./pages/Home";
import Compress from "./pages/Compress";
import Resize from "./pages/Resize";
import Convert from "./pages/Convert";

export default function App() {
  return (
    <div className="min-h-screen bg-[#fff8ec] text-[#24202c]">
      <header className="border-b-2 border-[#24202c] bg-[#ffd84d]">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:flex-nowrap sm:px-6">
          <Link
            to="/"
            className="font-logo inline-block origin-left text-2xl transition-transform duration-300 ease-out hover:scale-x-50 hover:scale-y-75 motion-reduce:transform-none"
          >
            Shrinko
          </Link>

          <div className="flex w-full items-center justify-between text-sm font-semibold sm:w-auto sm:justify-start sm:gap-4">
            <Link to="/compress" className="rounded-full px-2 py-2 sm:px-3">
              Compress
            </Link>

            <Link to="/resize" className="rounded-full px-2 py-2 sm:px-3">
              Resize
            </Link>

            <Link to="/convert" className="rounded-full px-2 py-2 sm:px-3">
              Convert
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
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