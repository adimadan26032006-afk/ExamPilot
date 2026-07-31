import { useEffect, useState } from "react";

function Library() {
    const [documents, setDocuments] = useState([]);

    const fetchDocuments = () => {
        fetch("http://localhost:8000/documents")
            .then((response) => response.json())
            .then((data) => setDocuments(data))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const deleteDocument = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:8000/documents/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                fetchDocuments();
            } else {
                alert("Failed to delete document.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="page-container">
            <h1>📚 My Library</h1>

            {documents.length === 0 ? (
                <p>No documents uploaded yet.</p>
            ) : (
                documents.map((doc) => (
                    <div
                        key={doc.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "15px",
                            marginBottom: "15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <h3>{doc.filename}</h3>
                            <p>{doc.pages} Pages</p>
                        </div>

                        <button
                            onClick={() => deleteDocument(doc.id)}
                        >
                            🗑 Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default Library;