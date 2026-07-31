import { useState } from "react";

export default function FlashcardSettings({
    document,
    onFlashcardsGenerated,
}) {

    const [loading, setLoading] = useState(false);

    async function generateFlashcards() {

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8000/generate-flashcards",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        document_id: document.id,
                    }),
                }
            );

            const data = await response.json();

            onFlashcardsGenerated(data.flashcards);

        } catch (error) {

            console.error(error);

            alert("Failed to generate flashcards.");

        } finally {

            setLoading(false);

        }

    }

    return (

        <div>

            <h2>Generate Flashcards</h2>

            <p>

                <strong>Document:</strong>

                {" "}

                {document.filename}

            </p>

            <br />

            <button
                onClick={generateFlashcards}
                disabled={loading}
            >

                {loading
                    ? "Generating..."
                    : "🧠 Generate Flashcards"}

            </button>

        </div>

    );

}