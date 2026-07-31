import json

from fastapi import APIRouter
from pydantic import BaseModel

from database.database import SessionLocal
from database.models import Upload

from services.document_service import (
    extract_document_text,
)

from services.ai_services import (
    generate_summary,
    generate_quiz,
    generate_flashcards,
    ask_ai,
)

router = APIRouter()


class SummaryRequest(BaseModel):
    document_id: int
    revision_style: str


class QuizRequest(BaseModel):
    document_id: int
    quiz_type: str
    difficulty: str
class ChatRequest(BaseModel):
    document_id: int
    question: str
class FlashcardRequest(BaseModel):
    document_id: int

# ==========================================
# Shared Document Helper
# ==========================================

def get_document_text(document_id: int, db):

    document = (
        db.query(Upload)
        .filter(Upload.id == document_id)
        .first()
    )

    if document is None:
        raise Exception("Document not found.")

    if not document.extracted_text:

        print(
            f"[AI] No extracted text found for document {document.id}"
        )

        print("[AI] Re-extracting document...")

        document.extracted_text = extract_document_text(
            document.filepath
        )

        db.commit()
        db.refresh(document)

        print(
            f"[AI] Recovered {len(document.extracted_text)} characters."
        )

    return document.extracted_text

def get_document_text(document_id: int, db):

    document = db.query(Upload).filter(
        Upload.id == document_id
    ).first()

    if document is None:
        raise Exception("Document not found.")

    # Old document with no extracted text
    if not document.extracted_text:

        print(
            f"[AI] Re-extracting text for document {document.id}"
        )

        document.extracted_text = extract_document_text(
            document.filepath
        )

        db.commit()
        db.refresh(document)

    return document.extracted_text




@router.post("/generate-summary")
def generate_summary_endpoint(request: SummaryRequest):

    db = SessionLocal()

    try:

        extracted_text = get_document_text(
            request.document_id,
            db,
        )
        document = (
    db.query(Upload)
    .filter(Upload.id == request.document_id)
    .first()
)

        if document.summary:

           print("[CACHE] Returning cached summary.")

           return {
        "summary": document.summary
    }

        summary = generate_summary(
    extracted_text,
    request.revision_style,
)

        document.summary = summary

        db.commit()

        return {
         "summary": summary
}
    finally:
        db.close()




@router.post("/generate-quiz")
def generate_quiz_endpoint(request: QuizRequest):

    db = SessionLocal()

    try:

        extracted_text = get_document_text(
            request.document_id,
            db,
        )

        quiz = generate_quiz(
            extracted_text,
            request.quiz_type,
            request.difficulty,
        )

        quiz = json.loads(quiz)

        return {
            "quiz": quiz
        }

    finally:
        db.close()

@router.post("/generate-flashcards")
def generate_flashcards_endpoint(request: FlashcardRequest):

    db = SessionLocal()

    try:

        extracted_text = get_document_text(
            request.document_id,
            db,
        )

        flashcards = generate_flashcards(
            extracted_text,
        )

        flashcards = json.loads(flashcards)

        return {
            "flashcards": flashcards
        }

    finally:
        db.close()


@router.post("/ask-ai")
def ask_ai_endpoint(request: ChatRequest):

    db = SessionLocal()

    try:

        extracted_text = get_document_text(
            request.document_id,
            db,
        )

        answer = ask_ai(
            extracted_text,
            request.question,
        )

        return {
            "answer": answer
        }

    finally:
        db.close()