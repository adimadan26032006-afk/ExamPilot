import { useState, useEffect, useRef } from "react";
import { animateStaggered } from "../utils/motion";
import ExamFlow from "../components/exam/ExamFlow";

import RevisionFlow from "../components/revision/RevisionFlow";
import QuizFlow from "../components/quiz/QuizFlow";
import FlashcardFlow from "../components/flashcards/FlashcardFlow";
import ChatFlow from "../components/chat/ChatFlow";

export default function Dashboard() {

 const [showRevisionFlow, setShowRevisionFlow] = useState(false);
 const [showQuizFlow, setShowQuizFlow] = useState(false);
 const [showFlashcardFlow, setShowFlashcardFlow] = useState(false);
 const [showChatFlow, setShowChatFlow] = useState(false);
 const [showExamFlow, setShowExamFlow] = useState(false);

  const [stats, setStats] = useState(null);
  const entranceStarted = useRef(false);
  const cardAnimation = useRef(null);
  const revealTimer = useRef(null);
  const animatedCards = useRef([]);

   useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (entranceStarted.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = Array.from(window.document.querySelectorAll(".dashboard-shell .dashboard-stat-card, .dashboard-shell .dashboard-feature-card"));
    if (!cards.length) return;
    entranceStarted.current = true;
    animatedCards.current = cards;

    const reveal = () => {
      window.clearTimeout(revealTimer.current);
      cards.forEach((card) => {
        card.style.removeProperty("opacity");
        card.style.removeProperty("transform");
      });
    };

    try {
      cardAnimation.current = animateStaggered(cards, {
        opacity: [0, 1],
        translateY: [20, 0],
        stagger: 100,
        duration: 500,
        complete: reveal,
      });
      if (cardAnimation.current) {
        revealTimer.current = window.setTimeout(() => {
          cardAnimation.current?.pause();
          reveal();
        }, 1500);
      } else {
        reveal();
      }
    } catch (error) {
      reveal();
      console.error(error);
    }
  }, [stats]);

  useEffect(() => () => {
    cardAnimation.current?.pause();
    window.clearTimeout(revealTimer.current);
    animatedCards.current.forEach((card) => {
      card.style.removeProperty("opacity");
      card.style.removeProperty("transform");
    });
  }, []);

  if (showExamFlow) {
  return (
    <ExamFlow
      onExit={() => setShowExamFlow(false)}
    />
  );
}

  if (showRevisionFlow) {
    return (
      <RevisionFlow
        onExit={() => setShowRevisionFlow(false)}
      />
    );
  }

  if (showQuizFlow) {
    return (
      <QuizFlow
        onExit={() => setShowQuizFlow(false)}
      />
    );
  }

  if (showFlashcardFlow) {
    return (
      <FlashcardFlow
        onExit={() => setShowFlashcardFlow(false)}
      />
    );
  }

  if (showChatFlow) {
    return (
      <ChatFlow
        onExit={() => setShowChatFlow(false)}
      />
    );
  }

  return (
    <div
      className="dashboard-shell"
      style={{
        minHeight: "100vh",
        padding: "50px",
        background: `
        radial-gradient(circle at top left, rgba(0,229,255,.18), transparent 30%),
        radial-gradient(circle at bottom right, rgba(0,120,255,.18), transparent 40%),
        linear-gradient(180deg,#05070A 0%,#0B0F14 45%,#101A28 100%)
        `,
      }}
    >
      <div className="dashboard-heading">
        <div className="eyebrow">YOUR LEARNING COMMAND CENTRE</div>
        <h1
          style={{
            fontSize: "56px",
          marginBottom: "10px",
          color: "#00E5FF",
          fontWeight: "800",
          textShadow: "0 0 18px rgba(0,229,255,.45)",
        }}
          >
            <span className="heading-gradient">✈ ExamPilot</span>
          </h1>

          <p
            style={{
          color: "#9FB5C8",
          fontSize: "20px",
          marginBottom: "40px",
        }}
      >
            Your AI-powered study companion.
          </p>
        </div>

      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "18px",
            marginBottom: "40px",
          }}
        >
          {[
            ["Pages", stats.total_pages],
            ["Summaries", stats.summaries_generated],
            ["Quizzes", stats.quizzes_generated],
            ["Flashcards", stats.flashcards_generated],
          ].filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => (
            <div className="card dashboard-stat-card" key={label}>
              <h3>{label}</h3>
              <h2>{value}</h2>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "28px",
        }}
      >
                  <div className="card dashboard-feature-card">
        <h2>🎯 Prepare for an Exam</h2>

  <p>
    Analyze PYQs, discover exam patterns,
    and prepare strategically.
  </p>

  <button onClick={() => setShowExamFlow(true)}>
    Start Preparing
  </button>
</div>
        <div className="card dashboard-feature-card">
          <h2>📖 Revision</h2>
          <p>Create beautiful AI revision notes.</p>
          <button onClick={() => setShowRevisionFlow(true)}>
            Open
          </button>
        </div>

        <div className="card dashboard-feature-card">
          <h2>❓ Test Yourself</h2>
          <p>University-style quizzes with explanations.</p>
          <button onClick={() => setShowQuizFlow(true)}>
            Open
          </button>
        </div>

        <div className="card dashboard-feature-card">
          <h2>💬 AI Tutor</h2>
          <p>Ask doubts directly from your notes.</p>
          <button onClick={() => setShowChatFlow(true)}>
            Open
          </button>
        </div>

            <div className="card dashboard-feature-card">
              <h2>🧠 Flashcards</h2>
              <p>Memorize concepts faster.</p>
              <button onClick={() => setShowFlashcardFlow(true)}>
                Open
              </button>
            </div>

            <div className="card dashboard-feature-card">
              <h2>📅 Study Planner</h2>
              <p>Coming Soon...</p>
            </div>

            <div className="card dashboard-feature-card">
              <h2>⏳ Focus Mode</h2>
              <p>Coming Soon...</p>
            </div>

        </div>
    </div>
  );
}