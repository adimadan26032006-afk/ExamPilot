import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

import Button from "../common/Button";

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
          lineHeight: "1.9",
          fontSize: "17px",
          background: "#f8f9fa",
          color: "#1f2937",
          padding: "25px",
          borderRadius: "12px",
          border: "1px solid #ddd",
        }}
      >

        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1 style={{ color: "#111827" }}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 style={{ color: "#111827" }}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 style={{ color: "#111827" }}>{children}</h3>
            ),
            p: ({ children }) => (
              <p style={{ color: "#374151" }}>{children}</p>
            ),
            li: ({ children }) => (
              <li style={{ color: "#374151" }}>{children}</li>
            ),
          }}
        >
          {summary}
        </ReactMarkdown>

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