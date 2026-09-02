import re


def clean_text(text: str) -> str:
    """
    Clean extracted PDF text while preserving useful
    document structure such as paragraphs and questions.
    """

    if not text:
        return ""

    # Normalize Windows/Mac line endings
    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Remove excessive spaces/tabs, but preserve newlines
    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    # Remove spaces at the beginning/end of lines
    text = re.sub(
        r" *\n *",
        "\n",
        text,
    )

    # Collapse excessive blank lines
    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 100,
):
    """
    Split text into overlapping word-based chunks while
    preserving question/paragraph boundaries as much as
    possible.

    chunk_size and overlap are measured in words.
    """

    text = clean_text(text)

    if not text:
        return []

    # Preserve paragraphs first
    paragraphs = [
        paragraph.strip()
        for paragraph in text.split("\n\n")
        if paragraph.strip()
    ]

    chunks = []

    current_words = []

    for paragraph in paragraphs:

        paragraph_words = paragraph.split()

        # If adding the paragraph keeps the chunk
        # within the target size, keep it together.
        if (
            current_words
            and len(current_words) + len(paragraph_words)
            <= chunk_size
        ):

            current_words.extend(
                paragraph_words
            )

            continue

        # Store existing chunk
        if current_words:

            chunks.append(
                " ".join(current_words)
            )

            # Keep overlap from the previous chunk
            current_words = current_words[
                -overlap:
            ]

        # Large paragraph: split it normally
        while len(paragraph_words) > chunk_size:

            part = paragraph_words[
                :chunk_size
            ]

            chunks.append(
                " ".join(
                    current_words + part
                )
            )

            paragraph_words = paragraph_words[
                chunk_size - overlap:
            ]

            current_words = []

        current_words.extend(
            paragraph_words
        )

    # Final chunk
    if current_words:

        chunks.append(
            " ".join(current_words)
        )

    return chunks