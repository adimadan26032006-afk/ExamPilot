import { useState } from "react";
import LoadingScreen from "../LoadingScreen";

export default function RevisionStylePicker({
  document,
  onSummaryGenerated,
}) {
  const [loading, setLoading] = useState(false);

  async function generateNotes(style) {
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/generate-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: document.id,
            revision_style: style,
          }),
        }
      );

      const data = await response.json();

      onSummaryGenerated(data.summary, style);
    } catch (error) {
      console.error(error);
      alert("Failed to generate notes.");
    }

    setLoading(false);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Choose a revision style</h2>

      <p>
        Selected document:
        <strong> {document?.filename}</strong>
      </p>

      <br />

      <button onClick={() => generateNotes("📄 Short Notes")}>
        📄 Short Notes
      </button>

      <br /><br />

      <button onClick={() => generateNotes("📖 Detailed Notes")}>
        📖 Detailed Notes
      </button>

      <br /><br />

      <button onClick={() => generateNotes("🎯 Exam Focus")}>
        🎯 Exam Focus
      </button>

      <br /><br />

      <button onClick={() => generateNotes("🌙 Last-Minute Revision")}>
        🌙 Last-Minute Revision
      </button>
    </div>
  );
}