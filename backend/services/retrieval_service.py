import re

from services.embedding_service import create_embedding
from services.vector_db import (
    search_chunks,
    get_document_chunks,
)


def _extract_question_number(question: str):
    """
    Detect references such as:

    question 2
    q2
    q 2
    problem 2
    solve 2
    """

    patterns = [
        r"\bquestion\s*#?\s*(\d+)\b",
        r"\bq\s*#?\s*(\d+)\b",
        r"\bproblem\s*#?\s*(\d+)\b",
        r"\bsolve\s+(?:question\s+)?(\d+)\b",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            question,
            re.IGNORECASE,
        )

        if match:
            return int(match.group(1))

    return None


def _contains_question_number(
    text: str,
    number: int,
):
    """
    Detect common ways a numbered question may appear
    after PDF text extraction.
    """

    n = str(number)

    patterns = [

        # 2. Solve...
        rf"(?m)^\s*{n}\s*[\.\)]\s*",

        # 2: Solve...
        rf"(?m)^\s*{n}\s*[:\-]\s*",

        # (2) Solve...
        rf"(?m)^\s*\(\s*{n}\s*\)\s*",

        # [2] Solve...
        rf"(?m)^\s*\[\s*{n}\s*\]\s*",

        # Q2 / Q 2
        rf"\bQ\s*{n}\b",

        # Question 2
        rf"\bQuestion\s+(?:No\.?\s*)?{n}\b",

        # Problem 2
        rf"\bProblem\s+(?:No\.?\s*)?{n}\b",

        # Sometimes PDF extraction puts just:
        #
        # 2
        # Solve ...
        #
        rf"(?m)^\s*{n}\s*$",
    ]

    for pattern in patterns:

        if re.search(
            pattern,
            text,
            re.IGNORECASE,
        ):
            return True

    return False


def _find_question_chunks(
    question_number: int,
    document_id: int,
):
    """
    Find the chunk containing a numbered question.

    We also include neighboring chunks because PDFs can
    split a single question across multiple chunks.
    """

    chunks = get_document_chunks(
        document_id
    )

    if not chunks:
        return []

    matching_index = None

    for index, chunk in enumerate(chunks):

        text = chunk.get("text", "")

        if _contains_question_number(
            text,
            question_number,
        ):

            matching_index = index
            break

    if matching_index is None:
        return []

    # Include previous chunk because the question may
    # start at the end of the previous chunk.
    start = max(
        0,
        matching_index - 1,
    )

    # Include two chunks after it because solutions,
    # equations or diagrams may continue.
    end = min(
        len(chunks),
        matching_index + 3,
    )

    selected_chunks = chunks[start:end]

    return [
        chunk["text"]
        for chunk in selected_chunks
    ]


def retrieve_relevant_chunks(
    question,
    document_id,
    top_k=3,
):
    """
    Main retrieval pipeline.

    1. If the student references a numbered question,
       try direct question retrieval.

    2. Otherwise use normal semantic retrieval.

    3. If direct question retrieval fails, fall back
       to semantic retrieval.
    """

    question_number = _extract_question_number(
        question
    )

    # ==========================================
    # NUMBERED QUESTION RETRIEVAL
    # ==========================================

    if question_number is not None:

        question_chunks = _find_question_chunks(
            question_number=question_number,
            document_id=document_id,
        )

        if question_chunks:

            print(
                f"[RAG] Found question {question_number}"
            )

            return {
                "documents": [
                    question_chunks
                ]
            }

        print(
            f"[RAG] Could not directly find "
            f"question {question_number}. "
            f"Falling back to semantic search."
        )

    # ==========================================
    # NORMAL SEMANTIC RETRIEVAL
    # ==========================================

    query_embedding = create_embedding(
        question
    )

    results = search_chunks(
        query_embedding=query_embedding,
        document_id=document_id,
        top_k=top_k,
    )

    return results