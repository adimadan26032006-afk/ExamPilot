import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>ExamPilot</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/library">Library</Link>
        <Link to="/upload">Upload</Link>
      </div>
    </nav>
  );
}