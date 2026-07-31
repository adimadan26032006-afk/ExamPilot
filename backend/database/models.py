from sqlalchemy import Column, Integer, String, DateTime, Text
from .database import Base
from datetime import datetime


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String)

    filepath = Column(String)

    pages = Column(Integer)

    extracted_text = Column(Text)
    summary = Column(Text, nullable=True)

    quiz = Column(Text, nullable=True)

    flashcards = Column(Text, nullable=True)

    upload_date = Column(
        DateTime,
        default=datetime.utcnow
    )
    