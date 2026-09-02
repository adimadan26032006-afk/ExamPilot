from sqlalchemy.orm import Session

from database.database import SessionLocal
from database.models import ChatMessage



def save_message(
    session_id: int,
    role: str,
    message: str,
):
    db: Session = SessionLocal()

    try:
        chat = ChatMessage(
            session_id=session_id,
            role=role,
            message=message,
        )

        db.add(chat)
        db.commit()

    finally:
        db.close()


def get_recent_messages(
    session_id: int,
    limit: int = 10,
):
    db: Session = SessionLocal()

    try:

        messages = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
            .all()
        )

        return list(reversed(messages))

    finally:
        db.close()

def get_session_messages(session_id: int):

    db: Session = SessionLocal()

    try:

        return (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at.asc())
            .all()
        )

    finally:

        db.close()