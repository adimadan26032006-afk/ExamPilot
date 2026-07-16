import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";

import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
