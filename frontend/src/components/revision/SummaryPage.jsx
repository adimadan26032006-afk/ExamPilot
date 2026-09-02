import "katex/dist/katex.min.css";

import Button from "../common/Button";
import MarkdownAnswer from "../MarkdownAnswer";

export default function SummaryPage({
  document,
  revisionStyle,
  summary,
  onGenerateQuiz,
}) {
  function copyNotes() {
    navigator.clipboard.writeText(summary);

    alert("Notes copied!");
  }

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h2>{revisionStyle}</h2>

      <p>
        <strong>Document:</strong> {document?.filename}
      </p>

      <hr />

      <div
        style={{
          marginTop: "25px",
          background: "#f8f9fa",
          color: "#1f2937",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid #ddd",
        }}
      >
        <MarkdownAnswer text={summary} />
      </div>

      <hr />

      <div
        style={{
          marginTop: "25px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <Button onClick={copyNotes}>
          📋 Copy Notes
        </Button>

        <Button onClick={onGenerateQuiz}>
          ❓ Generate Quiz
        </Button>

        <Button>
          🧠 Create Flashcards
        </Button>

        <Button>
          💬 Ask AI
        </Button>
      </div>
    </div>
  );
}