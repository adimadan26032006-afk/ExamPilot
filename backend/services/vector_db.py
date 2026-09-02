import chromadb


# =========================================================
# CHROMA DATABASE
# =========================================================

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="documents"
)


# =========================================================
# ADD DOCUMENT CHUNKS
# =========================================================

def add_document_chunks(
    chunks,
    embeddings,
    exam_id,
    document_id,
    document_type,
    filename,
):
    """
    Store document chunks and their embeddings in ChromaDB.
    Each chunk keeps metadata identifying its exam workspace,
    document, type, and position.
    """

    if not chunks:
        return 0

    ids = []
    documents = []
    metadatas = []

    for i, chunk in enumerate(chunks):

        ids.append(
            f"{document_id}_{i}"
        )

        documents.append(
            chunk
        )

        metadatas.append(
            {
                "exam_id": (
                    str(exam_id)
                    if exam_id is not None
                    else "none"
                ),

                "document_id": str(
                    document_id
                ),

                "document_type": (
                    document_type
                ),

                "filename": (
                    filename
                ),

                "chunk": i,
            }
        )

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )

    return len(chunks)


# =========================================================
# SEARCH CHUNKS
# =========================================================

def search_chunks(
    query_embedding,
    document_id,
    top_k=3,
):

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],

        n_results=top_k,

        where={
            "document_id": str(
                document_id
            )
        },
    )

    return results


# =========================================================
# GET DOCUMENT CHUNKS
# =========================================================

def get_document_chunks(
    document_id
):
    """
    Return all stored chunks for one document.
    """

    results = collection.get(
        where={
            "document_id": str(
                document_id
            )
        },

        include=[
            "documents",
            "metadatas",
        ],
    )

    documents = results.get(
        "documents",
        [],
    )

    metadatas = results.get(
        "metadatas",
        [],
    )

    chunks = []

    for document, metadata in zip(
        documents,
        metadatas,
    ):

        chunks.append(
            {
                "text": document,
                "metadata": metadata or {},
            }
        )

    chunks.sort(
        key=lambda item:
        item["metadata"].get(
            "chunk",
            0,
        )
    )

    return chunks
def search_exam_chunks(
    query_embedding,
    exam_id,
    top_k=5,
    distance_threshold=0.7,
):
    """
    Search chunks belonging to one exam.

    Only return chunks that are sufficiently relevant
    to the user's question.
    """

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={
            "exam_id": str(exam_id)
        },
    )

    distances = results.get("distances", [[]])[0]

    if not distances:
        return {
            "documents": [],
            "metadatas": [],
            "distances": [],
        }

    relevant_indexes = [
        i
        for i, distance in enumerate(distances)
        if distance <= distance_threshold
    ]

    return {
        "documents": [
            results["documents"][0][i]
            for i in relevant_indexes
        ],

        "metadatas": [
            results["metadatas"][0][i]
            for i in relevant_indexes
        ],

        "distances": [
            distances[i]
            for i in relevant_indexes
        ],
    }
def get_exam_chunks(exam_id):

    results = collection.get(
        where={
            "exam_id": str(exam_id)
        },
        include=[
            "documents",
            "metadatas",
        ],
    )

    return results.get("documents", [])