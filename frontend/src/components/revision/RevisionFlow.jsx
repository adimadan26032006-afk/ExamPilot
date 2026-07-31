import { useState } from "react";

import SourcePicker from "./SourcePicker";
import DocumentPicker from "../common/DocumentPicker";
import RevisionStylePicker from "./RevisionStylePicker";
import SummaryPage from "./SummaryPage";
import QuizFlow from "../quiz/QuizFlow";

export default function RevisionFlow({ onExit }) {

  const [step, setStep] = useState("source");

  const [selectedDocument, setSelectedDocument] = useState(null);

  const [summary, setSummary] = useState("");

  const [revisionStyle, setRevisionStyle] = useState("");

  const [showQuizFlow, setShowQuizFlow] = useState(false);

  function handleSourceSelect(source) {

    if (source === "notes") {

      setStep("documents");

    }

    else {

      alert("Study Any Topic coming soon!");

    }

  }

  function handleDocumentSelect(doc) {

    setSelectedDocument(doc);

    setStep("revisionStyle");

  }

  function handleSummaryGenerated(aiSummary, style) {

    setSummary(aiSummary);

    setRevisionStyle(style);

    setStep("summary");

  }

  function handleGenerateQuiz() {

    setShowQuizFlow(true);

  }

  function handleBack() {

    if (step === "source") {

      onExit();

    }

    else if (step === "documents") {

      setStep("source");

    }

    else if (step === "revisionStyle") {

      setStep("documents");

    }

    else if (step === "summary") {

      setStep("revisionStyle");

    }

  }

  if (showQuizFlow) {

    return (

      <QuizFlow
        initialDocument={selectedDocument}
        onExit={() => setShowQuizFlow(false)}
      />

    );

  }

  return (

    <div style={{ padding: "30px" }}>

      <button onClick={handleBack}>

        {step === "source"
          ? "← Dashboard"
          : "← Back"}

      </button>

      <br /><br />

      <h1>📖 Revision</h1>

      <hr />

      {step === "source" && (

        <SourcePicker
          feature="summary"
          onSourceSelect={handleSourceSelect}
        />

      )}

      {step === "documents" && (

        <DocumentPicker
          onDocumentSelect={handleDocumentSelect}
        />

      )}

      {step === "revisionStyle" && (

        <RevisionStylePicker
          document={selectedDocument}
          onSummaryGenerated={handleSummaryGenerated}
        />

      )}

      {step === "summary" && (

        <SummaryPage
          document={selectedDocument}
          revisionStyle={revisionStyle}
          summary={summary}
          onGenerateQuiz={handleGenerateQuiz}
        />

      )}

    </div>

  );

}