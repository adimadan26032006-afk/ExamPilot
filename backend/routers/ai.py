import json

from fastapi import APIRouter
from pydantic import BaseModel

from database.database import SessionLocal
from services.document_service import (
    get_document_by_id,
    extract_document_text,
)
from database.models import Upload
from services.ai_services import (
    generate_summary,
    generate_quiz,
    generate_flashcards,
    ask_ai,
)
from services.ocr_service import extract_text_with_ocr

from pypdf import PdfReader
import pdfplumber

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

        print("Requested document id:", request.document_id)

        document = get_document_by_id(
           request.document_id,db,)


        print("Document:", document)

        extracted_text = document.get("extracted_text")

        if not extracted_text:

           print("Old document detected. Extracting text...")

           extracted_text = document["extracted_text"]

        summary = generate_summary(
            extracted_text,
            request.revision_style,
        )

        return {
            "summary": summary
        }

    finally:
        db.close()


@router.post("/generate-quiz")
def generate_quiz_endpoint(request: QuizRequest):

    db = SessionLocal()

    try:

        document = get_document_by_id(
            request.document_id,
            db,
        )

        extracted_text = document.get("extracted_text")

        if not extracted_text:

          print("Old document detected. Extracting text...")

          extracted_text = document["extracted_text"]

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

        document = get_document_by_id(
            request.document_id,
            db,
        )

        extracted_text = document["extracted_text"]

        flashcards = generate_flashcards(extracted_text)

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

        document = get_document_by_id(
            request.document_id,
            db,
        )

        print(document["extracted_text"][:500])

        answer = ask_ai(
            document["extracted_text"],
            request.question,
        )

        return {
            "answer": answer
        }

    finally:
        db.close()