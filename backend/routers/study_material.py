from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Upload, ExamStudyMaterial


router = APIRouter(
    prefix="/study-materials",
    tags=["Study Material"],
)


# =========================================================
# GET ALL GLOBAL STUDY MATERIAL
# =========================================================

@router.get("")
def get_all_study_material(
    db: Session = Depends(get_db),
):
    documents = (
        db.query(Upload)
        .filter(
            Upload.document_type == "study_material"
        )
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


# =========================================================
# GET STUDY MATERIAL FOR ONE WORKSPACE
# =========================================================

@router.get("/exam/{exam_id}")
def get_exam_study_material(
    exam_id: int,
    db: Session = Depends(get_db),
):
    documents = (
        db.query(Upload)
        .join(
            ExamStudyMaterial,
            ExamStudyMaterial.document_id == Upload.id,
        )
        .filter(
            ExamStudyMaterial.exam_id == exam_id,
            Upload.document_type == "study_material",
        )
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


# =========================================================
# ATTACH EXISTING STUDY MATERIAL TO WORKSPACE
# =========================================================

@router.post("/exam/{exam_id}/{document_id}")
def attach_study_material(
    exam_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):

    document = (
        db.query(Upload)
        .filter(
            Upload.id == document_id,
            Upload.document_type == "study_material",
        )
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Study material not found",
        )

    existing = (
        db.query(ExamStudyMaterial)
        .filter(
            ExamStudyMaterial.exam_id == exam_id,
            ExamStudyMaterial.document_id == document_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Study material already attached to this workspace",
        )

    association = ExamStudyMaterial(
        exam_id=exam_id,
        document_id=document_id,
    )

    db.add(association)
    db.commit()
    db.refresh(association)

    return {
        "message": "Study material added to workspace",
        "exam_id": exam_id,
        "document_id": document_id,
    }


# =========================================================
# REMOVE STUDY MATERIAL FROM WORKSPACE
# =========================================================

@router.delete("/exam/{exam_id}/{document_id}")
def remove_study_material(
    exam_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):

    association = (
        db.query(ExamStudyMaterial)
        .filter(
            ExamStudyMaterial.exam_id == exam_id,
            ExamStudyMaterial.document_id == document_id,
        )
        .first()
    )

    if association is None:
        raise HTTPException(
            status_code=404,
            detail="Study material is not attached to this workspace",
        )

    db.delete(association)
    db.commit()

    return {
        "message": "Study material removed from workspace"
    }