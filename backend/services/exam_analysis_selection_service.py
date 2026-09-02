from database.database import SessionLocal
from database.models import Upload, ExamDocument


def get_selected_pyqs(
    exam_id: int,
    scope: str = "all",
    start_year: int = None,
    end_year: int = None,
    recent_years: int = 5,
):
    db = SessionLocal()

    try:

        documents = (
            db.query(Upload)
            .join(
                ExamDocument,
                ExamDocument.document_id == Upload.id,
            )
            .filter(
                ExamDocument.exam_id == exam_id,
                Upload.document_type == "pyq",
            )
            .all()
        )

        if not documents:
            return []

        selected = []

        for document in documents:

            # ------------------------------------------
            # Extract year from filename
            # ------------------------------------------

            year = extract_year(document.filename)

            if year is None:
                continue

            # ------------------------------------------
            # ALL PYQs
            # ------------------------------------------

            if scope == "all":

                selected.append(
                    (document, year)
                )

            # ------------------------------------------
            # CUSTOM RANGE
            # ------------------------------------------

            elif scope == "custom":

                if (
                    start_year is not None
                    and end_year is not None
                    and start_year <= year <= end_year
                ):

                    selected.append(
                        (document, year)
                    )

        # ------------------------------------------
        # RECENT PYQs
        # ------------------------------------------

        if scope == "recent":

            documents_with_years = []

            for document in documents:

                year = extract_year(
                    document.filename
                )

                if year is not None:

                    documents_with_years.append(
                        (document, year)
                    )

            documents_with_years.sort(
                key=lambda x: x[1],
                reverse=True,
            )

            selected = documents_with_years[
                :recent_years
            ]

        # ------------------------------------------
        # Sort oldest → newest
        # ------------------------------------------

        selected.sort(
            key=lambda x: x[1]
        )

        result = []

        for document, year in selected:

            result.append(
                {
                    "id": document.id,
                    "filename": document.filename,
                    "year": str(year),
                    "text": document.extracted_text or "",
                }
            )

        return result

    finally:

        db.close()


def extract_year(filename: str):

    import re

    if not filename:
        return None

    matches = re.findall(
        r"(20\d{2}|19\d{2})",
        filename,
    )

    if not matches:
        return None

    return int(matches[-1])