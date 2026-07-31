from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from services.document_service import (
    process_document,
    get_all_documents,
    get_document_by_id,
    delete_document
)

router = APIRouter(
    tags=["Upload"]
)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    return process_document(file, db)


@router.get("/documents")
def get_documents(
    db: Session = Depends(get_db)
):
    return get_all_documents(db)
@router.get("/documents/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    return get_document_by_id(document_id, db)


@router.delete("/documents/{document_id}")
def delete_uploaded_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    return delete_document(document_id, db)