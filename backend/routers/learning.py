from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Upload, ExamDocument
import json
import re
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
        .join(ExamDocument, ExamDocument.document_id == Upload.id)
        .filter(ExamDocument.exam_id == exam_id)
        .all()
    )

    if not docs:
        return {
            "error":
            "No study material found."
        }

    combined_text = ""

    for doc in docs:
        if doc.extracted_text:
            combined_text += doc.extracted_text[:15000] + "\n\n"

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
            "error": "The roadmap generator returned no content. Please try again."
        }

    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text).strip()

    try:
        roadmap = json.loads(text)
    except json.JSONDecodeError:
        json_match = re.search(r"\{[\s\S]*\}", text)
        if not json_match:
            return {"error": "The roadmap generator returned invalid data. Please try again."}
        try:
            roadmap = json.loads(json_match.group(0))
        except json.JSONDecodeError:
            return {"error": "The roadmap generator returned invalid data. Please try again."}

    if not isinstance(roadmap, dict):
        return {"error": "The roadmap generator returned an unexpected response. Please try again."}

    return roadmap