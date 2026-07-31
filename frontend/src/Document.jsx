import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Document() {
    const { id } = useParams();

    const [document, setDocument] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:8000/documents/${id}`)
            .then((response) => response.json())
            .then((data) => setDocument(data))
            .catch((error) => console.error(error));
    }, [id]);

    if (!document) {
        return <h2>Loading...</h2>;
    }

    return (
        <div style={{ padding: "30px" }}>
            <h1>📄 {document.filename}</h1>

            <p>{document.pages} Pages</p>

            <hr />

            <button>📝 Generate Summary</button>

            <br /><br />

            <button>🧠 Flashcards</button>

            <br /><br />

            <button>❓ Generate Quiz</button>

            <br /><br />

            <button>💬 Ask AI</button>

            <br /><br />

            <button>📖 Open Original PDF</button>
        </div>
    );
}

export default Document;

