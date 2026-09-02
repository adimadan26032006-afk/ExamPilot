from services.vector_store import (
    add_document_chunks,
    search_chunks,
)


chunks = [
    "A linked list is a linear data structure.",
    "A node contains data and a pointer to the next node.",
    "Traversal of a linked list takes O(n) time.",
]

# Temporary fake embeddings just to test Chroma storage/retrieval.
embeddings = [
    [1.0, 0.0, 0.0],
    [0.9, 0.1, 0.0],
    [0.8, 0.2, 0.0],
]


add_document_chunks(
    chunks=chunks,
    embeddings=embeddings,
    exam_id=1,
    document_id=999,
)

results = search_chunks(
    query_embedding=[0.95, 0.05, 0.0],
    exam_id=1,
    n_results=2,
)

print("RESULTS:")
print(results)