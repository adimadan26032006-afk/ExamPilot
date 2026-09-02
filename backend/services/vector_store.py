import chromadb


# Persistent local Chroma database
client = chromadb.PersistentClient(
    path="./chroma_db"
)


collection = client.get_or_create_collection(
    name="exam_documents"
)


def add_document_chunks(
    chunks,
    embeddings,
    exam_id,
    document_id,
    document_type,
    filename,
):

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

        # ADD THE METADATA HERE
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

                "document_type": document_type,

                "filename": filename,

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


def search_chunks(
    query_embedding,
    exam_id,
    n_results=5,
):
    """
    Search only inside the requested exam workspace.
    """

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={
            "exam_id": str(exam_id)
        },
    )

    return results

def search_exam_chunks(
    query_embedding,
    exam_id,
    top_k=5,
):
    """
    Search only chunks belonging to one exam workspace.
    """

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={
            "exam_id": str(exam_id)
        },
    )

    return results