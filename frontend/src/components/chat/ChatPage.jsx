import { useState } from "react";

import ChatMessage from "./ChatMessage";

export default function ChatPage({ document }) {

    const [messages, setMessages] = useState([]);

    const [question, setQuestion] = useState("");

    const [loading, setLoading] = useState(false);

    async function askQuestion() {

        if (question.trim() === "") return;

        const userMessage = {
            role: "user",
            text: question,
        };

        setMessages(prev => [...prev, userMessage]);

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8000/ask-ai",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        document_id: document.id,
                        question: question,
                    }),
                }
            );

            const data = await response.json();

            setMessages(prev => [

                ...prev,

                {
                    role: "assistant",
                    text: data.answer,
                }

            ]);

        } catch (error) {

            console.error(error);

            alert("Failed to contact AI.");

        }

        setQuestion("");

        setLoading(false);

    }

    return (

        <div>

            <h2>

                Chat with

                {" "}

                {document.filename}

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