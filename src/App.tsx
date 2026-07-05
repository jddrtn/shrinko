import { Link, Route, Routes } from "react-router";

import Home from "./pages/Home";
import Compress from "./pages/Compress";
import Resize from "./pages/Resize";
import Convert from "./pages/Convert";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold">
            Shrinko
          </Link>

          <div className="flex gap-4 text-sm text-zinc-300">
            <Link to="/compress">Compress</Link>
            <Link to="/resize">Resize</Link>
            <Link to="/convert">Convert</Link>
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