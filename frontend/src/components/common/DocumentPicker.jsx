import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function DocumentPicker({ onDocumentSelect }) {

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function fetchDocuments() {

            try {

                const response = await fetch(
                    `${API_BASE}/documents`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch documents.");
                }

                const data = await response.json();

                setDocuments(data);

            } catch (err) {

                console.error(err);
                setError("Unable to load documents.");

            } finally {

                setLoading(false);

            }

        }

        fetchDocuments();

    }, []);

    if (loading) {

        return (
            <p>Loading your documents...</p>
        );

    }

    if (error) {

        return (
            <p>{error}</p>
        );

    }

    if (documents.length === 0) {

        return (
            <p>No documents uploaded yet.</p>
        );

    }

    return (

        <div>

            <h2>Select a Document</h2>

            {documents.map((doc) => (

                <div
                    key={doc.id}
                    onClick={() => onDocumentSelect(doc)}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "15px",
                        marginBottom: "12px",
                        cursor: "pointer",
                        transition: "0.2s",
                    }}
                >

                    <h3 style={{ margin: 0 }}>
                        📄 {doc.filename}
                    </h3>

                    <p style={{ marginTop: "8px" }}>
                        {doc.pages} pages
                    </p>

                </div>

            ))}

        </div>

    );

}