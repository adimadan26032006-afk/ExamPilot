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

        <div>

            <h2>
                Chat with {document.filename}
            </h2>

            <br />

            <div
                style={{
                    border: "1px solid gray",
                    padding: "20px",
                    minHeight: "350px",
                    maxHeight: "450px",
                    overflowY: "auto",
                    borderRadius: "12px",
                }}
            >

                {messages.map((message, index) => (

                    <ChatMessage
                        key={index}
                        role={message.role}
                        text={message.text}
                    />

                ))}

            </div>

            <br />

            <input
                style={{
                    width: "70%",
                    padding: "12px",
                }}
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
            />

            <button
                onClick={askQuestion}
                disabled={loading}
            >

                {loading
                    ? "Thinking..."
                    : "Send"}

            </button>

        </div>

    );

}