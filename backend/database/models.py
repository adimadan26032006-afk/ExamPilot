from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey,Float
from .database import Base
from datetime import datetime


# =========================================================
# EXAM / SUBJECT WORKSPACE
# =========================================================

class Exam(Base):
    __tablename__ = "exams"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )
    pattern_analysis = Column(
    Text,
    nullable=True,
)

# =========================================================
# EXAM <-> DOCUMENT ASSOCIATION
# =========================================================

class ExamDocument(Base):
    __tablename__ = "exam_documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
        nullable=False,
        index=True,
    )

    document_id = Column(
        Integer,
        ForeignKey("uploads.id"),
        nullable=False,
        index=True,
    )





# =========================================================
# UPLOADED DOCUMENTS
# =========================================================

class Upload(Base):
    __tablename__ = "uploads"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    filename = Column(
        String,
        nullable=False,
    )

    filepath = Column(
        String,
    )

    pages = Column(
    Integer,
)

    exam_id = Column(
    Integer,
    nullable=True,
    index=True,
)

    year = Column(
    Integer,
    nullable=True,
    index=True,
)

    # -----------------------------------------------------
    # IMPORTANT:
    #
    # There is NO exam_id here anymore.
    #
    # A study material document can belong to multiple
    # exam workspaces through ExamDocument.
    # -----------------------------------------------------

    # -----------------------------------------------------
    # study_material
    # pyq
    # -----------------------------------------------------

    document_type = Column(
        String,
        default="study_material",
        nullable=False,
    )

    extracted_text = Column(
        Text,
    )

    short_summary = Column(
    Text,
    nullable=True,
)

    detailed_summary = Column(
    Text,
    nullable=True,
)

    exam_focused_summary = Column(
    Text,
    nullable=True,
)

    last_night_summary = Column(
    Text,
    nullable=True,
)

    quiz = Column(
        Text,
        nullable=True,
    )

    flashcards = Column(
        Text,
        nullable=True,
    )

    upload_date = Column(
        DateTime,
        default=datetime.utcnow,
    )


# =========================================================
# CHAT SESSIONS
# =========================================================

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    document_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    title = Column(
        String,
        default="New Chat",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )


# =========================================================
# CHAT MESSAGES
# =========================================================

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    session_id = Column(
        Integer,
        nullable=False,
        index=True,
    )

    role = Column(
        String,
    )

    message = Column(
        Text,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

# =========================================================
# EXAM ↔ STUDY MATERIAL ASSOCIATION
# =========================================================

class ExamStudyMaterial(Base):
    __tablename__ = "exam_study_materials"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
        nullable=False,
        index=True,
    )

    document_id = Column(
        Integer,
        ForeignKey("uploads.id"),
        nullable=False,
        index=True,
    )

class TestAttempt(Base):

    __tablename__ = "test_attempts"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
    )

    test_type = Column(
        String,
    )

    score = Column(
        Float,
    )

    total_marks = Column(
        Float,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )
class TopicPerformance(Base):

    __tablename__ = "topic_performance"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    exam_id = Column(
        Integer,
        ForeignKey("exams.id"),
    )

    topic = Column(
        String,
    )

    correct = Column(
        Integer,
        default=0,
    )

    total = Column(
        Integer,
        default=0,
    )