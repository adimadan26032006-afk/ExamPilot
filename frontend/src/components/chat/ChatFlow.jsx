import { useEffect, useState } from "react";
import { getSessions } from "../../api/chat";

import SourcePicker from "../revision/SourcePicker";
import DocumentPicker from "../common/DocumentPicker";
import ChatPage from "./ChatPage";
import ChatSidebar from "./ChatSidebar";
import "./Chat.css";

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

        <div className="chat-shell">
            <div className="chat-topbar">
                <button className="chat-back-button" onClick={handleBack}>
                    <span aria-hidden="true">←</span>
                    {step === "source" ? "Dashboard" : "Back"}
                </button>
                <div className="chat-brand">
                    <span className="chat-brand-mark">✦</span>
                    <div>
                        <p className="chat-eyebrow">EXAMPILOT AI</p>
                        <h1>Ask AI</h1>
                    </div>
                </div>
                <span className="chat-status"><span /> Ready to help</span>
            </div>

            <div className="chat-divider" />

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

    <div className="chat-workspace">

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

        <div className="chat-main-panel">

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