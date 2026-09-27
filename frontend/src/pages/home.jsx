import { useEffect, useState } from "react";
import { animateHero } from "../utils/motion";


export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    animateHero(".home-hero > *");
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      });
  }, []);

  return (
    <main className="home-page page-container">
      <div className="home-hero">
        <div className="eyebrow">THE FUTURE OF STUDYING</div>
        <h1><span className="heading-gradient">Study smarter.</span><br />Fly further.</h1>
        <p>{message || "Your AI-powered study companion for clearer notes, sharper recall, and confident exams."}</p>
        <div className="home-actions">
          <a className="home-primary" href="/dashboard">Open dashboard <span>↗</span></a>
          <a className="home-secondary" href="/upload">Upload material</a>
        </div>
      </div>
      <div className="home-glow-card"><span className="home-card-icon">✦</span><strong>One focused workspace</strong><span>Turn your notes into momentum.</span></div>
    </main>
  );
}