import os
from pypdf import PdfReader
from fastapi import HTTPException


from database.models import Upload


def process_document(file, db):
    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join("uploads", file.filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    reader = PdfReader(file_path)
    page_count = len(reader.pages)

    upload = Upload(
        filename=file.filename,
        filepath=file_path,
        pages=page_count
    )

    db.add(upload)
    db.commit()
    db.refresh(upload)

    extracted_text = ""

    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + "\n"

    return {
        "message": "File uploaded successfully!",
        "filename": file.filename,
        "pages": page_count,
        "text": extracted_text
    }
from database.models import Upload


def get_all_documents(db):
    documents = db.query(Upload).order_by(Upload.id.desc()).all()

    return [
        {
            "id": doc.id,
            "filename": doc.filename,
            "filepath": doc.filepath,
            "pages": doc.pages,
        }
        for doc in documents
    ]
def delete_document(document_id, db):
    document = db.query(Upload).filter(Upload.id == document_id).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    if os.path.exists(document.filepath):
        os.remove(document.filepath)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully!"}