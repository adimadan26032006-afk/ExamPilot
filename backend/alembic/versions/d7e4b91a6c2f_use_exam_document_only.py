"""use ExamDocument as the only exam-document association

Revision ID: d7e4b91a6c2f
Revises: e9fe142ad4fe
Create Date: 2026-09-02 23:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d7e4b91a6c2f"
down_revision: Union[str, Sequence[str], None] = "e9fe142ad4fe"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.execute(
        """
        INSERT INTO exam_documents (exam_id, document_id)
        SELECT u.exam_id, u.id
        FROM uploads u
        WHERE u.exam_id IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM exam_documents ed
              WHERE ed.exam_id = u.exam_id
                AND ed.document_id = u.id
          )
        """
    )

    op.execute(
        """
        INSERT INTO exam_documents (exam_id, document_id)
        SELECT esm.exam_id, esm.document_id
        FROM exam_study_materials esm
        WHERE NOT EXISTS (
            SELECT 1
            FROM exam_documents ed
            WHERE ed.exam_id = esm.exam_id
              AND ed.document_id = esm.document_id
        )
        """
    )

    op.drop_index(
        "ix_exam_study_materials_document_id",
        table_name="exam_study_materials",
    )
    op.drop_index(
        "ix_exam_study_materials_exam_id",
        table_name="exam_study_materials",
    )
    op.drop_index(
        "ix_exam_study_materials_id",
        table_name="exam_study_materials",
    )
    op.drop_table("exam_study_materials")

    op.drop_index(
        op.f("ix_uploads_exam_id"),
        table_name="uploads",
    )
    op.drop_column("uploads", "exam_id")


def downgrade() -> None:
    """Downgrade schema."""

    op.add_column(
        "uploads",
        sa.Column("exam_id", sa.Integer(), nullable=True),
    )
    op.create_index(
        op.f("ix_uploads_exam_id"),
        "uploads",
        ["exam_id"],
        unique=False,
    )

    op.execute(
        """
        UPDATE uploads
        SET exam_id = exam_documents.exam_id
        FROM exam_documents
        WHERE uploads.id = exam_documents.document_id
        """
    )

    op.create_table(
        "exam_study_materials",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("exam_id", sa.Integer(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["uploads.id"]),
        sa.ForeignKeyConstraint(["exam_id"], ["exams.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_exam_study_materials_id",
        "exam_study_materials",
        ["id"],
        unique=False,
    )
    op.create_index(
        "ix_exam_study_materials_exam_id",
        "exam_study_materials",
        ["exam_id"],
        unique=False,
    )
    op.create_index(
        "ix_exam_study_materials_document_id",
        "exam_study_materials",
        ["document_id"],
        unique=False,
    )
