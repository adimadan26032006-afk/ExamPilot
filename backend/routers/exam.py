from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from services.ai_services import generate_mock_test
from sqlalchemy import func

from database.database import get_db
from database.models import Exam
from services.embedding_service import create_embedding
from services.vector_store import search_exam_chunks
from services.vector_store import get_exam_chunks
from database.models import Upload, ExamDocument
from services.ai_services import generate_subjective_test
from database.models import (
    TestAttempt,
    TopicPerformance,
)

router = APIRouter(
    prefix="/exams",
    tags=["Exams"],
)

# ==========================================
# Request schema
# ==========================================

class ExamCreate(BaseModel):
    name: str


# ==========================================
# Get all exam workspaces
# ==========================================

@router.get("")
def get_exams(
    db: Session = Depends(get_db),
):

    exams = (
        db.query(Exam)
        .order_by(Exam.id.desc())
        .all()
    )

    return [
        {
            "id": exam.id,
            "name": exam.name,
            "created_at": exam.created_at,
        }
        for exam in exams
    ]


# ==========================================
# Create exam workspace
# ==========================================

@router.post("")
def create_exam(
    data: ExamCreate,
    db: Session = Depends(get_db),
):

    if not data.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Exam name cannot be empty",
        )

    exam = Exam(
        name=data.name.strip(),
    )

    db.add(exam)
    db.commit()
    db.refresh(exam)

    return {
        "id": exam.id,
        "name": exam.name,
        "created_at": exam.created_at,
    }


# ==========================================
# Get one exam
# ==========================================

@router.get("/{exam_id}")
def get_exam(
    exam_id: int,
    db: Session = Depends(get_db),
):

    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam workspace not found",
        )

    return {
        "id": exam.id,
        "name": exam.name,
        "created_at": exam.created_at,
    }


# ==========================================
# Delete exam workspace
# ==========================================

@router.delete("/{exam_id}")
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
):

    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam workspace not found",
        )

    db.delete(exam)
    db.commit()

    return {
        "message": "Exam workspace deleted successfully"
    }

@router.get("/{exam_id}/search")
def search_exam(
    exam_id: int,
    q: str,
):
    query_embedding = create_embedding(q)

    results = search_exam_chunks(
        query_embedding=query_embedding,
        exam_id=exam_id,
        top_k=5,
    )

    return {
        "query": q,
        "results": results,
    }

@router.get("/{exam_id}/chunks")
def get_chunks(
    exam_id: int,
):
    return get_exam_chunks(exam_id)
class MockTestRequest(BaseModel):
    question_count: int = 10
    difficulty: str = "Mixed"
class SubjectiveTestRequest(BaseModel):
    question_count: int = 5
    difficulty: str = "Mixed"


@router.post("/{exam_id}/mock-test")
def create_mock_test(
    exam_id: int,
    data: MockTestRequest,
    db: Session = Depends(get_db),
):

    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )
    import json

    pattern_analysis = ""

    if exam.pattern_analysis:
        try:
           pattern_analysis = json.loads(
            exam.pattern_analysis
        )
        except:
          pattern_analysis = exam.pattern_analysis
  
    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam workspace not found",
        )

    if data.question_count not in [5, 10, 15, 20]:
        raise HTTPException(
            status_code=400,
            detail="Question count must be 5, 10, 15, or 20",
        )

    if data.difficulty not in [
        "Easy",
        "Moderate",
        "Hard",
        "Mixed",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid difficulty",
        )

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
      raise HTTPException(
        status_code=400,
        detail="No PYQs found for this exam."
    )

    pyq_text = "\n\n".join(
    doc.extracted_text
    for doc in documents
    if doc.extracted_text
)

    if not pyq_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No usable PYQ text found for this exam.",
        )

    print("\n========== PYQ TEXT SENT TO GEMINI ==========\n")
    print(pyq_text[:5000])
    print("\n=============================================\n")

    result = generate_mock_test(
    pyq_text=pyq_text,
    pattern_analysis=pattern_analysis,
    question_count=data.question_count,
    difficulty=data.difficulty,
)

    if "error" in result:
        raise HTTPException(
            status_code=503,
            detail=result["error"],
        )

    return result
@router.post("/{exam_id}/subjective-test")
def create_subjective_test(
    exam_id: int,
    data: SubjectiveTestRequest,
    db: Session = Depends(get_db),
):

    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if exam is None:
        raise HTTPException(
            status_code=404,
            detail="Exam workspace not found",
        )

    pattern_analysis = (
        exam.pattern_analysis or ""
    )

    if data.question_count not in [5, 10, 15]:
        raise HTTPException(
            status_code=400,
            detail="Question count must be 5, 10 or 15",
        )

    if data.difficulty not in [
        "Easy",
        "Moderate",
        "Hard",
        "Mixed",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid difficulty",
        )

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
        raise HTTPException(
            status_code=400,
            detail="No PYQs found for this exam.",
        )

    pyq_text = "\n\n".join(
        doc.extracted_text
        for doc in documents
        if doc.extracted_text
    )

    if not pyq_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No usable PYQ text found.",
        )

    result = generate_subjective_test(
        pyq_text=pyq_text,
        pattern_analysis=pattern_analysis,
        question_count=data.question_count,
        difficulty=data.difficulty,
    )

    if "error" in result:
        raise HTTPException(
            status_code=503,
            detail=result["error"],
        )

    return result
class SubjectiveEvaluationRequest(BaseModel):
    questions: list
    answers: dict


@router.post("/{exam_id}/evaluate-subjective")
def evaluate_subjective_answers(
    exam_id: int,
    data: SubjectiveEvaluationRequest,
    db: Session = Depends(get_db),
):

    from google import genai
    import json

    prompt = f"""
You are an expert university examiner.

Evaluate the student's answers.

For each question:

- Give marks obtained.
- Give maximum marks.
- Explain what was correct.
- Explain what was missing.
- Give a short improvement suggestion.

Return ONLY valid JSON.

Format:

{{
  "total_marks": 0,
  "obtained_marks": 0,
  "feedback": [
    {{
      "question_number": 1,
      "marks_awarded": 0,
      "max_marks": 5,
      "strengths": "...",
      "weaknesses": "...",
      "suggestion": "...",
      "ideal_answer": "..."
    }}
  ]
}}
For each question also provide:

ideal_answer

A concise university-level model answer
that would score full marks.

The answer should be practical and
exam-oriented, not excessively long.

Questions:
{json.dumps(data.questions)}

Student Answers:
{json.dumps(data.answers)}
"""

    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
    )

    text = response.text.strip()

    if text.startswith("```json"):
        text = text[7:].strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    try:
        result = json.loads(text)
      
        attempt = TestAttempt(
              exam_id=exam_id,
              test_type="subjective",
              score=result["obtained_marks"],
              total_marks=result["total_marks"],
          )
      
        db.add(attempt)
        db.commit()
      
        return result

    except Exception as e:
        print("EVALUATION ERROR:", e)

        return {
        "error": "Gemini returned invalid evaluation."
    }

@router.get("/{exam_id}/analytics")
def get_exam_analytics(
    exam_id: int,
    db: Session = Depends(get_db),
):

    attempts = (
        db.query(TestAttempt)
        .filter(
            TestAttempt.exam_id == exam_id
        )
        .order_by(
            TestAttempt.created_at.desc()
        )
        .all()
    )

    if not attempts:
        return {
            "tests_attempted": 0,
            "average_percentage": 0,
            "best_percentage": 0,
            "latest_score": 0,
            "latest_total": 0,
        }

    percentages = [
        (a.score / a.total_marks) * 100
        for a in attempts
        if a.total_marks > 0
    ]

    latest_attempt = attempts[0]

    return {
        "tests_attempted":
            len(attempts),

        "average_percentage":
            round(
                sum(percentages)
                / len(percentages),
                1
            ),

        "best_percentage":
            round(
                max(percentages),
                1
            ),

        "latest_score":
            latest_attempt.score,

        "latest_total":
            latest_attempt.total_marks,
    }
class ObjectiveAttemptRequest(BaseModel):
    score: float
    total_marks: float


@router.post("/{exam_id}/save-objective-attempt")
def save_objective_attempt(
    exam_id: int,
    data: ObjectiveAttemptRequest,
    db: Session = Depends(get_db),
):

    attempt = TestAttempt(
        exam_id=exam_id,
        test_type="objective",
        score=data.score,
        total_marks=data.total_marks,
    )

    db.add(attempt)
    db.commit()

    return {
        "message": "saved"
    }