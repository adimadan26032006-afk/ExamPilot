import { useState } from "react";
import DropZone from "../components/common/DropZone";


export default function Upload() {

  const [file, setFile] = useState(null);

  async function handleUpload() {

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "http://127.0.0.1:8000/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log(data);

    alert(`✅ Uploaded: ${data.filename}`);
  }

  return (

    <div className="page-container">

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          marginBottom: "70px",
        }}
      >

        <h1
          style={{
            color: "#00E5FF",
            fontSize: "54px",
            fontWeight: "800",
            marginBottom: "24px",
            textShadow: "0 0 18px rgba(0,229,255,.35)",
          }}
        >
          📚 Upload Study Material
        </h1>

        <p
          style={{
            color: "#9FB5C8",
            fontSize: "20px",
            lineHeight: "1.8",
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          Upload your study materials and let ExamPilot generate
          AI-powered revision notes, quizzes, flashcards, and
          personalized tutoring.

          <br /><br />

          <span
            style={{
              color: "#00E5FF",
              fontWeight: "700",
            }}
          >
            Supported formats:
          </span>

          {" "}
          PDF • DOCX • PPTX • TXT
        </p>

      </div>

      <div
        className="card"
        style={{
          maxWidth: "650px",
          margin: "0 auto",
          textAlign: "center",
          padding: "50px",
        }}
      >

        <h2
          style={{
            marginBottom: "30px",
          }}
        >
          Choose a file
        </h2>

        <DropZone onFileSelect={setFile} />

<br /><br />

<p
  style={{
    color: "#A6C0D4",
    minHeight: "25px",
    fontSize: "16px",
  }}
>
  {file
    ? `✅ Selected: ${file.name}`
    : "No file selected"}
</p>

        <br />

        <button
          onClick={handleUpload}
        >
          🚀 Upload Study Material
        </button>

      </div>

    </div>

  );

}