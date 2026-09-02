from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Upload
import json
from services.ai_services import _generate_with_retry

router = APIRouter(
    prefix="/learning",
    tags=["Learning"],
)


@router.post("/{exam_id}/roadmap")
def generate_learning_roadmap(
    exam_id: int,
    db: Session = Depends(get_db),
):

    docs = (
    db.query(Upload)
    .filter(
        Upload.exam_id == exam_id
    )
    .all()
)

    if not docs:
        return {
            "error":
            "No study material found."
        }

    combined_text = ""

    for doc in docs:
        combined_text += (
            doc.extracted_text[:15000]
            + "\n\n"
        )

    prompt = f"""
You are an expert university professor.

Analyze the study material.

Return ONLY valid JSON.

{{
  "high_priority_topics": [],
  "frequently_asked_concepts": [],
  "important_formulas": [],
  "common_mistakes": [],
  "predicted_questions": [],
  "revision_sheet": []
}}

Study Material:

{combined_text}
"""

    text = _generate_with_retry(prompt)

    if not text:
        return {
            "error": "Gemini is temporarily unavailable. Please try again."
        }

    text = text.strip()

    if text.startswith("```json"):
        text = text[7:].strip()

    if text.endswith("```"):
        text = text[:-3].strip()

    return json.loads(text)