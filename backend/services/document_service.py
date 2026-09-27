import os
import re
import uuid
import pdfplumber
from fastapi import HTTPException
from pypdf import PdfReader

from services.vector_store import(
    collection,
    add_document_chunks,
)

from database.models import Upload, Exam, ExamDocument

from services.ocr_service import extract_text_with_ocr

from services.embedding_service import create_embedding
from services.chunking_service import chunk_text


# ==========================================
# Configuration
# ==========================================

UPLOAD_FOLDER = "uploads"
MIN_TEXT_LENGTH = 100


# ==========================================
# Logging
# ==========================================

def log(message: str):
    print(f"[DocumentService] {message}")


# ==========================================
# Individual Extractors
# ==========================================

def extract_with_pypdf(filepath: str) -> str:

    text = ""

    try:

        reader = PdfReader(filepath)

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    except Exception as e:

        log(f"PyPDF failed -> {e}")

    return text.strip()


def extract_with_pdfplumber(filepath: str) -> str:

    text = ""

    try:

        with pdfplumber.open(filepath) as pdf:

            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

    except Exception as e:

        log(f"pdfplumber failed -> {e}")

    return text.strip()


# ==========================================
# Master Extraction
# ==========================================

def extract_document_text(filepath: str):

    log("Starting text extraction...")

    pypdf_text = extract_with_pypdf(filepath)

    log(
        f"PyPDF extracted "
        f"{len(pypdf_text)} characters"
    )

    plumber_text = ""

    if len(pypdf_text) < MIN_TEXT_LENGTH:

        plumber_text = extract_with_pdfplumber(
            filepath
        )

        log(
            f"pdfplumber extracted "
            f"{len(plumber_text)} characters"
        )

    best_text = (
        plumber_text
        if len(plumber_text) > len(pypdf_text)
        else pypdf_text
    )

    extractor_used = (
        "pdfplumber"
        if (
            best_text == plumber_text
            and len(plumber_text) > 0
        )
        else "PyPDF"
    )

    # ------------------------------------------
    # OCR fallback
    # ------------------------------------------

    if len(best_text) < MIN_TEXT_LENGTH:

        log("Using OCR fallback...")

        ocr_text = extract_text_with_ocr(
            filepath
        )

        log(
            f"OCR extracted "
            f"{len(ocr_text)} characters"
        )

        if len(ocr_text) > len(best_text):

            best_text = ocr_text
            extractor_used = "OCR"

    log(
        f"Final extractor -> "
        f"{extractor_used}"
    )

    log(
        f"Final text length -> "
        f"{len(best_text)}"
    )

    return best_text


# ==========================================
# Store Chroma Chunks
# ==========================================

def index_document(
    document_id: int,
    filename: str,
    text: str,
    document_type: str = "study_material",
):
    """
    Create fresh ChromaDB chunks for a document.

    Existing vectors for this document are deleted
    first so re-indexing never creates duplicates.
    """

    collection.delete(
        where={
            "document_id": str(document_id)
        }
    )

    chunks = chunk_text(text)

    if not chunks:

        log(
            f"No chunks created for "
            f"document {document_id}"
        )

        return 0

    for i, chunk in enumerate(chunks):

        embedding = create_embedding(chunk)

        collection.add(
            ids=[
                f"{document_id}_{i}"
            ],

            embeddings=[
                embedding
            ],

            documents=[
                chunk
            ],

            metadatas=[
                {
                    "document_id": str(document_id),
                    "filename": filename,
                    "document_type": document_type,
                    "chunk": i,
                }
            ],
        )

    log(
        f"Indexed document "
        f"{document_id}: "
        f"{len(chunks)} chunks"
    )

    return len(chunks)

def detect_pyq_year(text: str, filename: str = ""):

    # ------------------------------------------
    # 1. Look for year in extracted document text
    # ------------------------------------------

    if text:

        patterns = [
            r"(?:question\s*paper|examination|exam|semester\s*examination|end\s*semester)"
            r".{0,80}?\b(20\d{2})\b",

            r"\b(20\d{2})\b.{0,80}?"
            r"(?:question\s*paper|examination|exam|semester)",
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE | re.DOTALL,
            )

            if match:

                year = int(match.group(1))

                if 1990 <= year <= 2100:

                    log(
                        f"Detected PYQ year from document: {year}"
                    )

                    return year

    # ------------------------------------------
    # 2. Fallback to filename
    # ------------------------------------------

    if filename:

        matches = re.findall(
            r"\b(19\d{2}|20\d{2})\b",
            filename,
        )

        if matches:

            year = int(matches[-1])

            if 1990 <= year <= 2100:

                log(
                    f"Detected PYQ year from filename: {year}"
                )

                return year

    # ------------------------------------------
    # 3. Could not determine year
    # ------------------------------------------

    log(
        "Could not automatically determine PYQ year."
    )

    return None


# ==========================================
# Upload
# ==========================================

def process_document(
    file,
    db,
    exam_id=None,
    document_type="study_material",
):

    # ==========================================
    # Validate document type
    # ==========================================

    if document_type not in [
        "study_material",
        "pyq",
    ]:

        raise HTTPException(
            status_code=400,
            detail="Invalid document type",
        )

    # ==========================================
    # Validate exam rules
    # ==========================================

    exam = None

    if exam_id is not None:

        exam = (
            db.query(Exam)
            .filter(Exam.id == exam_id)
            .first()
        )

        if exam is None:

            raise HTTPException(
                status_code=404,
                detail="Exam not found",
            )

    # ------------------------------------------
    # PYQs MUST belong to an exam
    # ------------------------------------------

    if document_type == "pyq" and exam_id is None:

        raise HTTPException(
            status_code=400,
            detail="A PYQ must belong to an exam workspace.",
        )

    # ==========================================
    # Save uploaded file
    # ==========================================

    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True,
    )

    original_filename = os.path.basename(file.filename or "upload.pdf")
    _, extension = os.path.splitext(original_filename)
    if extension.lower() != ".pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported",
        )

    safe_stem = re.sub(
        r"[^A-Za-z0-9._-]+",
        "_",
        os.path.splitext(original_filename)[0],
    ).strip("._") or "upload"
    stored_filename = f"{safe_stem}_{uuid.uuid4().hex}.pdf"
    upload_root = os.path.abspath(UPLOAD_FOLDER)
    filepath = os.path.join(upload_root, stored_filename)

    with open(filepath, "wb") as buffer:

        buffer.write(
            file.file.read()
        )

    # ==========================================
    # Get page count
    # ==========================================

    reader = PdfReader(filepath)

    page_count = len(
        reader.pages
    )

    # ==========================================
    # Extract text
    # ==========================================

    extracted_text = extract_document_text(
        filepath
    )

    # ==========================================
    # Detect PYQ year
    # ==========================================

    pyq_year = None

    if document_type == "pyq":

        pyq_year = detect_pyq_year(
            extracted_text,
            original_filename,
        )

        log(
            f"PYQ year -> {pyq_year}"
        )

    # ==========================================
    # Create database record
    # ==========================================

    upload = Upload(
        filename=original_filename,
        filepath=filepath,
        pages=page_count,
        exam_id=exam_id,
        document_type=document_type,
        extracted_text=extracted_text,
        year=pyq_year,
    )

    try:
        db.add(upload)
        db.flush()

        # ==========================================
        # Create workspace association
        # ==========================================

        if exam_id is not None:
            association = ExamDocument(
                exam_id=exam_id,
                document_id=upload.id,
            )
            db.add(association)

        # ==========================================
        # CHUNK + EMBED + STORE IN CHROMA
        # ==========================================

        chunks = chunk_text(upload.extracted_text)

        if chunks:
            embeddings = [
                create_embedding(chunk)
                for chunk in chunks
            ]

            add_document_chunks(
                chunks=chunks,
                embeddings=embeddings,
                exam_id=exam_id,
                document_id=upload.id,
                document_type=document_type,
                filename=upload.filename,
            )

            log(
                f"Stored {len(chunks)} chunks "
                f"in ChromaDB."
            )

        db.commit()
        db.refresh(upload)

    except Exception as error:
        db.rollback()
        try:
            collection.delete(
                where={"document_id": str(upload.id)}
            )
        except Exception as cleanup_error:
            log(f"Vector cleanup failed -> {cleanup_error}")
        if os.path.exists(filepath):
            os.remove(filepath)
        log(f"Upload processing failed -> {error}")
        raise HTTPException(
            status_code=500,
            detail="Upload processing failed; no document was saved.",
        ) from error
    # ==========================================
    # Upload is committed only after indexing succeeds
    # ==========================================

    # ==========================================
    # Logging
    # ==========================================

    log(
        f"Saved '{file.filename}' "
        f"(ID={upload.id}) "
        f"(Exam={exam_id}) "
        f"(Type={document_type}) "
        f"(Year={upload.year})"
    )

    # ==========================================
    # Response
    # ==========================================

    return {
        "message": "File uploaded successfully!",

        "id": upload.id,

        "filename": upload.filename,

        "filepath": upload.filepath,

        "pages": upload.pages,

        "exam_id": exam_id,

        "document_type": upload.document_type,

        "year": upload.year,

        "has_text": bool(
            upload.extracted_text
        ),
    }


# ==========================================
# Read All Documents
# ==========================================

def get_all_documents(db):

    documents = (
        db.query(Upload)
        .order_by(
            Upload.id.desc()
        )
        .all()
    )

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "filepath": doc.filepath,
            "pages": doc.pages,
            "document_type": doc.document_type,
            "has_text": bool(
                doc.extracted_text
            ),
        }
        for doc in documents
    ]


# ==========================================
# Read One Document
# ==========================================

def get_document_by_id(
    document_id,
    db,
):

    document = (
        db.query(Upload)
        .filter(
            Upload.id == document_id
        )
        .first()
    )

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    return {
        "id": document.id,
        "filename": document.filename,
        "filepath": document.filepath,
        "pages": document.pages,
        "document_type": document.document_type,
        "extracted_text": document.extracted_text,
        "has_text": bool(
            document.extracted_text
        ),
    }


# ==========================================
# Delete
# ==========================================

def delete_document(
    document_id,
    db,
):

    document = (
        db.query(Upload)
        .filter(
            Upload.id == document_id
        )
        .first()
    )

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    # ------------------------------------------
    # Delete workspace associations
    # ------------------------------------------

    db.query(ExamDocument).filter(
        ExamDocument.document_id == document.id
    ).delete(
        synchronize_session=False
    )

    # ------------------------------------------
    # Delete Chroma vectors
    # ------------------------------------------

    collection.delete(
        where={
            "document_id": str(
                document.id
            )
        }
    )

    # ------------------------------------------
    # Delete PDF
    # ------------------------------------------

    if (
        document.filepath
        and os.path.exists(
            document.filepath
        )
    ):

        os.remove(
            document.filepath
        )

    # ------------------------------------------
    # Delete database record
    # ------------------------------------------

    db.delete(document)

    db.commit()

    log(
        f"Deleted document "
        f"{document_id}"
    )

    return {
        "message": "Document deleted successfully!"
    }


# ==========================================
# Dashboard Stats
# ==========================================

def get_dashboard_stats(db):

    total_documents = (
        db.query(Upload).count()
    )

    return {
        "total_documents": total_documents
    }