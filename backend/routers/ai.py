import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.session_service import create_session

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
    extract_pyq_questions,
    solve_pyq_question,
)
from services.retrieval_service import retrieve_relevant_chunks
from services.document_service import get_document_by_id
from services.session_service import get_document_sessions
from services.chat_service import get_session_messages

router = APIRouter()


class SummaryRequest(BaseModel):
    document_id: int
    revision_style: str


class QuizRequest(BaseModel):
    document_id: int
    quiz_type: str
    difficulty: str
class ChatRequest(BaseModel):
    session_id: int
    question: str
class FlashcardRequest(BaseModel):
    document_id: int
class CreateSessionRequest(BaseModel):
    document_id: int
class SolveQuestionRequest(BaseModel):
    question: str
# ==========================================
# Shared Document Helper
# ==========================================


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

        # ==========================================
        # FIND DOCUMENT
        # ==========================================

        document = (
            db.query(Upload)
            .filter(
                Upload.id == request.document_id
            )
            .first()
        )

        if document is None:

            return {
                "error": "Document not found."
            }

        # ==========================================
        # SUMMARY STYLE → DATABASE COLUMN
        # ==========================================

        summary_columns = {

            # Frontend names WITH emojis
            "📄 Short Notes":
                "short_summary",

            "📖 Detailed Notes":
                "detailed_summary",

            "🎯 Exam Focus":
                "exam_focused_summary",

            "🌙 Last-Minute Revision":
                "last_night_summary",

            # Names WITHOUT emojis
            "Short Notes":
                "short_summary",

            "Detailed Notes":
                "detailed_summary",

            "Exam Focus":
                "exam_focused_summary",

            "Last-Minute Revision":
                "last_night_summary",

            # Short internal names
            "Short":
                "short_summary",

            "Detailed":
                "detailed_summary",

            "Exam":
                "exam_focused_summary",

            "Last Night":
                "last_night_summary",
        }

        # ==========================================
        # DETERMINE CORRECT CACHE COLUMN
        # ==========================================

        column_name = summary_columns.get(
            request.revision_style
        )

        print(
            f"[SUMMARY] "
            f"Style='{request.revision_style}' "
            f"-> Column='{column_name}'"
        )

        # ==========================================
        # INVALID STYLE
        # ==========================================

        if column_name is None:

            return {
                "error": "Invalid revision style."
            }

        # ==========================================
        # CHECK CACHE
        # ==========================================

        cached_summary = getattr(
            document,
            column_name,
            None,
        )

        if cached_summary:

            print(
                f"[SUMMARY] "
                f"Returning cached "
                f"{request.revision_style} summary..."
            )

            return {
                "summary": cached_summary,
                "cached": True,
            }

        # ==========================================
        # CACHE MISS → GENERATE NEW SUMMARY
        # ==========================================

        print(
            f"[SUMMARY] "
            f"Generating new "
            f"{request.revision_style} summary..."
        )

        summary = generate_summary(
            document.extracted_text,
            request.revision_style,
        )

        # ==========================================
        # SAVE TO CORRECT COLUMN
        # ==========================================

        setattr(
            document,
            column_name,
            summary,
        )

        db.commit()

        print(
            f"[SUMMARY] "
            f"Saved summary to '{column_name}'."
        )

        # ==========================================
        # RESPONSE
        # ==========================================

        return {

            "summary": summary,

            "cached": False,

            "style": request.revision_style,

        }

    finally:

        db.close()

@router.post("/generate-quiz")
def generate_quiz_endpoint(request: QuizRequest):

    db = SessionLocal()

    try:

        document_model = db.query(Upload).filter(
            Upload.id == request.document_id
        ).first()

        if document_model is None:
            return {
                "error": "Document not found."
            }

        quiz = generate_quiz(
            document_model.extracted_text,
            request.quiz_type,
            request.difficulty,
        )

        document_model.quiz = quiz

        db.commit()

        quiz = json.loads(quiz)

        return {
            "quiz": quiz,
            "cached": False,
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

@router.post("/create-session")
def create_session_endpoint(request: CreateSessionRequest):

    db = SessionLocal()

    try:

        # Verify document exists
        get_document_by_id(
            request.document_id,
            db,
        )

        session = create_session(
            request.document_id,
        )

        return {
            "session_id": session.id,
            "title": session.title,
        }

    finally:

        db.close()


@router.post("/ask-ai")
def ask_ai_endpoint(request: ChatRequest):

    answer = ask_ai(
        session_id=request.session_id,
        question=request.question,
    )

    return {
        "answer": answer
    }

@router.get("/documents/{document_id}/questions")
def get_pyq_questions(document_id: int):
    db = SessionLocal()

    try:
        document = db.query(Upload).filter(
            Upload.id == document_id,
            Upload.document_type == "pyq",
        ).first()

        if document is None:
            raise HTTPException(
                status_code=404,
                detail="PYQ document not found.",
            )

        extracted_text = get_document_text(document_id, db)
        if not extracted_text or not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="This PYQ has no extracted text.",
            )

        result = extract_pyq_questions(extracted_text)
        if "error" in result:
            raise HTTPException(status_code=503, detail=result["error"])

        return {
            "document_id": document_id,
            "questions": result["questions"],
        }
    finally:
        db.close()

@router.post("/pyq/solve-question")
def solve_pyq_question_endpoint(request: SolveQuestionRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    result = solve_pyq_question(question)
    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])

    return result
@router.get("/chat-sessions/{document_id}")
def get_chat_sessions(document_id: int):

    sessions = get_document_sessions(document_id)

    return [
        {
            "id": session.id,
            "title": session.title,
            "created_at": session.created_at,
        }
        for session in sessions
    ]
@router.get("/chat-history/{session_id}")
def get_chat_history(session_id: int):

    messages = get_session_messages(session_id)

    return [
        {
            "role": message.role,
            "message": message.message,
            "created_at": message.created_at,
        }
        for message in messages
    ]