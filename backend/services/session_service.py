from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import ChatSession


def create_session(document_id: int):

    db: Session = SessionLocal()

    try:

        session = ChatSession(
            document_id=document_id,
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return session

    finally:

        db.close()


def get_session(session_id: int):

    db: Session = SessionLocal()

    try:

        return (
            db.query(ChatSession)
            .filter(ChatSession.id == session_id)
            .first()
        )

    finally:

        db.close()


def get_document_sessions(document_id: int):

    db: Session = SessionLocal()

    try:

        return (
            db.query(ChatSession)
            .filter(ChatSession.document_id == document_id)
            .order_by(ChatSession.created_at.desc())
            .all()
        )

    finally:

        db.close()