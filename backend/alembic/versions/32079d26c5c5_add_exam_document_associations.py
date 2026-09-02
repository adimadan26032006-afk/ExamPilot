"""add exam document associations

Revision ID: 32079d26c5c5
Revises: 4ad4dff8c5e7
Create Date: 2026-08-09 10:13:57.736003
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "32079d26c5c5"
down_revision: Union[str, Sequence[str], None] = "4ad4dff8c5e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # -----------------------------------------------------
    # 1. Copy existing exam_id relationships
    #    into exam_documents
    # -----------------------------------------------------

    op.execute(
        """
        INSERT INTO exam_documents (exam_id, document_id)
        SELECT exam_id, id
        FROM uploads
        WHERE exam_id IS NOT NULL
        """
    )

    # -----------------------------------------------------
    # 2. Remove old exam_id index
    # -----------------------------------------------------

    op.drop_index(
        op.f("ix_uploads_exam_id"),
        table_name="uploads",
    )

    # -----------------------------------------------------
    # 3. Remove old exam_id column
    # -----------------------------------------------------

    op.drop_column(
        "uploads",
        "exam_id",
    )


def downgrade() -> None:

    # -----------------------------------------------------
    # 1. Restore exam_id column
    # -----------------------------------------------------

    op.add_column(
        "uploads",
        sa.Column(
            "exam_id",
            sa.INTEGER(),
            nullable=True,
        ),
    )

    # -----------------------------------------------------
    # 2. Restore index
    # -----------------------------------------------------

    op.create_index(
        op.f("ix_uploads_exam_id"),
        "uploads",
        ["exam_id"],
        unique=False,
    )

    # -----------------------------------------------------
    # 3. Restore relationships
    # -----------------------------------------------------

    op.execute(
        """
        UPDATE uploads
        SET exam_id = exam_documents.exam_id
        FROM exam_documents
        WHERE uploads.id = exam_documents.document_id
        """
    )
