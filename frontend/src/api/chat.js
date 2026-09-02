const API_BASE = "http://127.0.0.1:8000";

// -----------------------------
// Create a new chat session
// -----------------------------
export async function createSession(documentId) {
    const response = await fetch(`${API_BASE}/create-session`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            document_id: documentId,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to create chat session.");
    }

    return await response.json();
}

// -----------------------------
// Get all chat sessions
// -----------------------------
export async function getSessions(documentId) {
    const response = await fetch(
        `${API_BASE}/chat-sessions/${documentId}`
    );

    if (!response.ok) {
        throw new Error("Failed to load chat sessions.");
    }

    return await response.json();
}

// -----------------------------
// Get chat history
// -----------------------------
export async function getHistory(sessionId) {
    const response = await fetch(
        `${API_BASE}/chat-history/${sessionId}`
    );

    if (!response.ok) {
        throw new Error("Failed to load chat history.");
    }

    return await response.json();
}

// -----------------------------
// Ask AI
// -----------------------------
export async function askAI(sessionId, question) {
    const response = await fetch(`${API_BASE}/ask-ai`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            session_id: sessionId,
            question: question,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to contact AI.");
    }

    return await response.json();
}