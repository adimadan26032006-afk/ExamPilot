import { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";

const API_BASE = "http://localhost:8000";

export default function ChatPage({
    document,
    sessionId,
}) {

    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    // ----------------------------
    // Load previous chat messages
    // ----------------------------

    useEffect(() => {

        async function loadHistory() {

            if (!sessionId) {
                setMessages([]);
                return;
            }

            try {

                const response = await fetch(
                    `${API_BASE}/chat-history/${sessionId}`
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to load chat history."
                    );
                }

                const data = await response.json();

                const formattedMessages = data.map((msg) => ({
                    role: msg.role,
                    text: msg.message,
                }));

                setMessages(formattedMessages);

            } catch (error) {

                console.error(
                    "Chat history error:",
                    error
                );

                setMessages([]);

            }

        }

        loadHistory();

    }, [sessionId]);

    // ----------------------------
    // Ask AI
    // ----------------------------

    async function askQuestion() {

        if (!question.trim() || loading) {
            return;
        }

        if (!sessionId) {

            alert("Please create a new chat first.");

            return;

        }

        const userQuestion = question.trim();

        // Show user message immediately
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: userQuestion,
            },
        ]);

        setQuestion("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_BASE}/ask-ai`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        session_id: sessionId,
                        question: userQuestion,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to get AI response."
                );
            }

            const data = await response.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: data.answer,
                },
            ]);

        } catch (error) {

            console.error(
                "AI request error:",
                error
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text:
                        "⚠️ I couldn't get a response right now. Please try again.",
                },
            ]);

        } finally {

            setLoading(false);

        }

    }

    return (

        <div className="chat-page">
            <div className="chat-page-heading">
                <div>
                    <p className="chat-eyebrow">DOCUMENT CHAT</p>
                    <h2>{document.filename}</h2>
                </div>
                <div className="chat-doc-badge">▤ Notes</div>
            </div>

            <div className="chat-history">

                {messages.map((message, index) => (

                    <ChatMessage
                        key={index}
                        role={message.role}
                        text={message.text}
                    />

                ))}

            </div>

            <div className="chat-composer">
                <input
                    value={question}
                onChange={(e) =>
                    setQuestion(e.target.value)
                }
                onKeyDown={(e) => {

                    if (
                        e.key === "Enter" &&
                        !loading
                    ) {

                        askQuestion();

                    }

                }}
                    placeholder="Ask anything from your notes..."
                    aria-label="Ask anything from your notes"
                />

                <button
                    className="chat-send-button"
                    onClick={askQuestion}
                    disabled={loading}
                    aria-label={loading ? "Thinking" : "Send message"}
                >
                    {loading ? "Thinking..." : "Send ↗"}
                </button>
            </div>
            <p className="chat-hint">Press <kbd>Enter</kbd> to send · Answers are grounded in your selected notes</p>

        </div>

    );

}