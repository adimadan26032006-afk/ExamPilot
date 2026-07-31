import os

import pdfplumber
from fastapi import HTTPException
from pypdf import PdfReader

from database.models import Upload
from services.ocr_service import extract_text_with_ocr


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
    log(f"PyPDF extracted {len(pypdf_text)} characters")

    plumber_text = ""

    if len(pypdf_text) < MIN_TEXT_LENGTH:

        plumber_text = extract_with_pdfplumber(filepath)

        log(
            f"pdfplumber extracted {len(plumber_text)} characters"
        )

    best_text = (
        plumber_text
        if len(plumber_text) > len(pypdf_text)
        else pypdf_text
    )

    extractor_used = (
        "pdfplumber"
        if best_text == plumber_text and len(plumber_text) > 0
        else "PyPDF"
    )

    if len(best_text) < MIN_TEXT_LENGTH:

        log("Using OCR fallback...")

        ocr_text = extract_text_with_ocr(filepath)

        log(f"OCR extracted {len(ocr_text)} characters")

        if len(ocr_text) > len(best_text):

            best_text = ocr_text
            extractor_used = "OCR"

    log(f"Final extractor -> {extractor_used}")
    log(f"Final text length -> {len(best_text)}")

    return best_text


# ==========================================
# Upload
# ==========================================

def process_document(file, db):

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    filepath = os.path.join(
        UPLOAD_FOLDER,
        file.filename,
    )

    with open(filepath, "wb") as buffer:
        buffer.write(file.file.read())

    reader = PdfReader(filepath)
    page_count = len(reader.pages)

    extracted_text = extract_document_text(filepath)

    upload = Upload(
        filename=file.filename,
        filepath=filepath,
        pages=page_count,
        extracted_text=extracted_text,
    )

    db.add(upload)
    db.commit()
    db.refresh(upload)

    log(
        f"Saved '{file.filename}' "
        f"(ID={upload.id})"
    )

    return {
        "message": "File uploaded successfully!",
        "id": upload.id,
        "filename": upload.filename,
        "filepath": upload.filepath,
        "pages": upload.pages,
        "has_text": bool(upload.extracted_text),
    }


# ==========================================
# Read All Documents
# ==========================================

def get_all_documents(db):

    documents = (
        db.query(Upload)
        .order_by(Upload.id.desc())
        .all()
    )

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "filepath": doc.filepath,
            "pages": doc.pages,
            "has_text": bool(doc.extracted_text),
        }
        for doc in documents
    ]


# ==========================================
# Read One Document
# ==========================================

def get_document_by_id(document_id, db):

    document = (
        db.query(Upload)
        .filter(Upload.id == document_id)
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
        "extracted_text": document.extracted_text,
        "has_text": bool(document.extracted_text),
    }


# ==========================================
# Delete
# ==========================================

def delete_document(document_id, db):

    document = (
        db.query(Upload)
        .filter(Upload.id == document_id)
        .first()
    )

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    if (
        document.filepath
        and os.path.exists(document.filepath)
    ):
        os.remove(document.filepath)

    db.delete(document)
    db.commit()

    log(f"Deleted document {document_id}")

    return {
        "message": "Document deleted successfully!"
    }