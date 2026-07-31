import { useState } from "react";

import SourcePicker from "../revision/SourcePicker";
import DocumentPicker from "../common/DocumentPicker";
import FlashcardSettings from "./FlashcardSettings";
import FlashcardCard from "./FlashcardCard";

export default function FlashcardFlow({ onExit }) {

    const [step, setStep] = useState("source");

    const [selectedDocument, setSelectedDocument] = useState(null);

    const [flashcards, setFlashcards] = useState([]);

    function handleSourceSelect(source) {

        if (source === "notes") {

            setStep("documents");

        } else {

            alert("Study Any Topic coming soon!");

        }

    }

    function handleDocumentSelect(document) {

        setSelectedDocument(document);

        setStep("settings");

    }

    function handleFlashcardsGenerated(cards) {

        setFlashcards(cards);

        setStep("cards");

    }

    function handleBack() {

        if (step === "source") {

            onExit();

        }

        else if (step === "documents") {

            setStep("source");

        }

        else if (step === "settings") {

            setStep("documents");

        }

        else if (step === "cards") {

            setStep("settings");

        }

    }

    return (

        <div style={{ padding: "30px" }}>

            <button onClick={handleBack}>
                {step === "source"
                    ? "← Dashboard"
                    : "← Back"}
            </button>

            <br /><br />

            <h1>🧠 Flashcards</h1>

            <hr />

            {step === "source" && (

                <SourcePicker
                    feature="flashcards"
                    onSourceSelect={handleSourceSelect}
                />

            )}

            {step === "documents" && (

                <DocumentPicker
                    onDocumentSelect={handleDocumentSelect}
                />

            )}

            {step === "settings" && (

                <FlashcardSettings
                    document={selectedDocument}
                    onFlashcardsGenerated={handleFlashcardsGenerated}
                />

            )}

            {step === "cards" && (

                <FlashcardCard
                    flashcards={flashcards}
                />

            )}

        </div>

    );

}