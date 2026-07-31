from database.database import SessionLocal
from database.models import Upload
from services.document_service import extract_document_text

db = SessionLocal()

try:

    documents = (
        db.query(Upload)
        .filter(
            (Upload.extracted_text == None) |
            (Upload.extracted_text == "")
        )
        .all()
    )

    print(f"Found {len(documents)} documents to repair.\n")

    for doc in documents:

        print(f"Repairing: {doc.filename}")

        try:

            extracted_text = extract_document_text(doc.filepath)

            doc.extracted_text = extracted_text

            db.commit()

            print(
                f"✓ Saved {len(extracted_text)} characters\n"
            )

        except Exception as e:

            print(f"✗ Failed: {e}\n")

finally:

    db.close()

print("Repair complete.")