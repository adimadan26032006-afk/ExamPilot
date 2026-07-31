import { useState } from "react";

import RevisionFlow from "../components/revision/RevisionFlow";
import QuizFlow from "../components/quiz/QuizFlow";
import FlashcardFlow from "../components/flashcards/FlashcardFlow";
import ChatFlow from "../components/chat/ChatFlow";

export default function Dashboard() {

  const [showRevisionFlow, setShowRevisionFlow] = useState(false);
  const [showQuizFlow, setShowQuizFlow] = useState(false);
  const [showFlashcardFlow, setShowFlashcardFlow] = useState(false);
  const [showChatFlow, setShowChatFlow] = useState(false);

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
    <h1
      style={{
        fontSize: "56px",
        marginBottom: "10px",
        color: "#00E5FF",
        fontWeight: "800",
        textShadow: "0 0 18px rgba(0,229,255,.45)",
      }}
    >
      ✈ ExamPilot
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

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        gap: "28px",
      }}
    >
      <div className="card">
        <h2>📖 Revision</h2>
        <p>Create beautiful AI revision notes.</p>
        <button onClick={() => setShowRevisionFlow(true)}>
          Open
        </button>
      </div>

      <div className="card">
        <h2>❓ Test Yourself</h2>
        <p>University-style quizzes with explanations.</p>
        <button onClick={() => setShowQuizFlow(true)}>
          Open
        </button>
      </div>

      <div className="card">
        <h2>💬 AI Tutor</h2>
        <p>Ask doubts directly from your notes.</p>
        <button onClick={() => setShowChatFlow(true)}>
          Open
        </button>
      </div>

      <div className="card">
        <h2>🧠 Flashcards</h2>
        <p>Memorize concepts faster.</p>
        <button onClick={() => setShowFlashcardFlow(true)}>
          Open
        </button>
      </div>

      <div className="card">
        <h2>📅 Study Planner</h2>
        <p>Coming Soon...</p>
      </div>

      <div className="card">
        <h2>⏳ Focus Mode</h2>
        <p>Coming Soon...</p>
      </div>
    </div>
  </div>
);
}