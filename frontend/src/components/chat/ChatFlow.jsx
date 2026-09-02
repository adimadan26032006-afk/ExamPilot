import { useEffect, useState } from "react";
import { getSessions } from "../../api/chat";

import SourcePicker from "../revision/SourcePicker";
import DocumentPicker from "../common/DocumentPicker";
import ChatPage from "./ChatPage";
import ChatSidebar from "./ChatSidebar";

export default function ChatFlow({ onExit }) {

    const [step, setStep] = useState("source");

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [sessions, setSessions] = useState([]);

    const [currentSession, setCurrentSession] = useState(null);

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
    useEffect(() => {

    if (!selectedDocument) return;

    async function loadSessions() {

        try {

            const data = await getSessions(
                selectedDocument.id
            );

            setSessions(data);

        }

        catch (err) {

            console.error(err);

        }

    }

    loadSessions();

}, [selectedDocument]);

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

    <div
        style={{
            display: "flex",
            height: "80vh",
            border: "1px solid #ddd",
            borderRadius: "12px",
            overflow: "hidden",
            marginTop: "20px",
        }}
    >

        <ChatSidebar
    sessions={sessions}
    currentSession={currentSession}
    onSessionSelect={(session) => {
        setCurrentSession(session);
    }}
   onNewChat={async () => {

    try {

        const { createSession } = await import("../../api/chat");

        const data = await createSession(
            selectedDocument.id
        );

        const newSession = {
            id: data.session_id,
            title: data.title,
        };

        setSessions(prev => [
            newSession,
            ...prev,
        ]);

        setCurrentSession(newSession);

    }

    catch (err) {

        console.error(err);

        alert("Failed to create chat.");

    }

}}
/>

        <div
            style={{
                flex: 1,
                padding: "20px",
                overflow: "auto",
            }}
        >

            <ChatPage
    document={selectedDocument}
    sessionId={currentSession?.id}
/>
        </div>

    </div>

)}

        </div>

    );

}