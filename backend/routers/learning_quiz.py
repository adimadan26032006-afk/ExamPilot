from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Exam

from services.ai_services import _generate_with_retry as generate_text

router = APIRouter()


@router.post("/{exam_id}/quiz")
def generate_quiz(
    exam_id: int,
    db: Session = Depends(get_db),
):
    exam = (
        db.query(Exam)
        .filter(Exam.id == exam_id)
        .first()
    )

    if not exam:
        return {
            "error": "Exam not found"
        }

    prompt = f"""
Generate 10 MCQs for:

{exam.name}

Return ONLY JSON.

Format:

{{
    "questions":[
        {{
            "question":"...",
            "options":[
                "A",
                "B",
                "C",
                "D"
            ],
            "answer":0
        }}
    ]
}}

answer = index of correct option.
"""

    response = generate_text(prompt)

    return response