import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span><strong>Exam</strong>Pilot</span>
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/library">Library</Link>
        <Link className="navbar-cta" to="/upload"><span>＋</span> Upload</Link>
      </div>
    </nav>
  );
}