import { useState } from "react";

import SourcePicker from "../revision/SourcePicker";
import DocumentPicker from "../common/DocumentPicker";
import ChatPage from "./ChatPage";

export default function ChatFlow({ onExit }) {

    const [step, setStep] = useState("source");

    const [selectedDocument, setSelectedDocument] = useState(null);

    function handleSourceSelect(source) {

        if (source === "notes") {

            setStep("documents");

        } else {

            alert("Study Any Topic chat coming soon!");

        }

    }

    function handleDocumentSelect(document) {

        setSelectedDocument(document);

        setStep("chat");

    }

    function handleBack() {

        if (step === "source") {

            onExit();

        }

        else if (step === "documents") {

            setStep("source");

        }

        else if (step === "chat") {

            setStep("documents");

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

            <h1>💬 Ask AI</h1>

            <hr />

            {step === "source" && (

                <SourcePicker
                    feature="chat"
                    onSourceSelect={handleSourceSelect}
                />

            )}

            {step === "documents" && (

                <DocumentPicker
                    onDocumentSelect={handleDocumentSelect}
                />

            )}

            {step === "chat" && (

                <ChatPage
                    document={selectedDocument}
                />

            )}

        </div>

    );

}