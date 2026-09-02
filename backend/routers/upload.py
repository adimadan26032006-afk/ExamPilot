from fastapi import APIRouter, UploadFile, File, Depends, Form, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Upload, ExamDocument,Exam

from services.document_service import (
    process_document,
    get_all_documents,
    get_document_by_id,
    delete_document,
    get_dashboard_stats,
)

from services.chunking_service import chunk_text
from services.ai_services import (
    analyze_exam_pattern,
    generate_practice_paper,
)


router = APIRouter(
    tags=["Upload"]
)


# =========================================================
# UPLOAD DOCUMENT
# =========================================================

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    exam_id: int | None = Form(None),
    document_type: str = Form("study_material"),
    db: Session = Depends(get_db),
):
    return process_document(
        file=file,
        db=db,
        exam_id=exam_id,
        document_type=document_type,
    )


# =========================================================
# GET ALL DOCUMENTS
# =========================================================

@router.get("/documents")
def get_documents(
    db: Session = Depends(get_db)
):
    return get_all_documents(db)


# =========================================================
# GET ONE DOCUMENT
# =========================================================

@router.get("/documents/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    return get_document_by_id(
        document_id,
        db
    )


# =========================================================
# PREVIEW DOCUMENT CHUNKS
# =========================================================

@router.get("/documents/{document_id}/chunks")
def preview_chunks(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = get_document_by_id(
        document_id,
        db
    )

    chunks = chunk_text(
        document["extracted_text"]
    )

    return {
        "total_chunks": len(chunks),
        "chunks": chunks,
    }


# =========================================================
# DELETE DOCUMENT
# =========================================================

@router.delete("/documents/{document_id}")
def delete_uploaded_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    return delete_document(
        document_id,
        db
    )


# =========================================================
# GET DOCUMENTS BELONGING TO AN EXAM
# =========================================================

@router.get("/exams/{exam_id}/documents")
def get_exam_documents(
    exam_id: int,
    db: Session = Depends(get_db),
):
    documents = (
        db.query(Upload)
        .join(
            ExamDocument,
            ExamDocument.document_id == Upload.id,
        )
        .filter(
            ExamDocument.exam_id == exam_id
        )
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
            "exam_id": exam_id,
            "document_type": doc.document_type,
            "has_text": bool(
                doc.extracted_text
            ),
        }
        for doc in documents
    ]

# =========================================================
# EXAM PATTERN ANALYSIS
# =========================================================

@router.get("/exams/{exam_id}/analyze-pattern")
def analyze_exam(
    exam_id: int,
    db: Session = Depends(get_db),
):
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
        .order_by(
            Upload.year.asc().nullslast(),
            Upload.id.asc(),
        )
        .all()
    )

    if not documents:
        raise HTTPException(
            status_code=404,
            detail="No PYQs found for this exam workspace.",
        )

    pyq_sections = []

    for doc in documents:

        year = (
            str(doc.year)
            if doc.year is not None
            else "Year not available"
        )

        pyq_sections.append(
            f"""
===== PYQ =====
Filename: {doc.filename}
Year: {year}

{doc.extracted_text}
"""
        )

    pyq_text = "\n".join(
        pyq_sections
    )

    analysis = analyze_exam_pattern(
        pyq_text
    )
    exam = (
    db.query(Exam)
    .filter(Exam.id == exam_id)
    .first()
)

    import json

    exam.pattern_analysis = json.dumps(analysis)

    db.commit()   
    return {
        "exam_id": exam_id,
        "papers_analyzed": len(documents),
        "analysis": analysis,
    }

@router.post("/exams/{exam_id}/practice-paper")
def create_practice_paper(
    exam_id: int,
    question_count: int = 10,
    difficulty: str = "Moderate",
    db: Session = Depends(get_db),
):

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
        .order_by(
            Upload.year.asc().nullslast(),
            Upload.id.asc(),
        )
        .all()
    )

    if not documents:
        raise HTTPException(
            status_code=404,
            detail="No PYQs found for this exam workspace.",
        )

    pyq_sections = []

    for doc in documents:

        year = (
            str(doc.year)
            if doc.year is not None
            else "Year not available"
        )

        pyq_sections.append(
            f"""
===== PYQ =====
Filename: {doc.filename}
Year: {year}

{doc.extracted_text}
"""
        )

    pyq_text = "\n".join(pyq_sections)

    paper = generate_practice_paper(
        pyq_text=pyq_text,
        question_count=question_count,
        difficulty=difficulty,
    )

    return {
        "exam_id": exam_id,
        "paper": paper,
    }
# =========================================================
# DASHBOARD STATS
# =========================================================

@router.get("/dashboard/stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):
    return get_dashboard_stats(db)