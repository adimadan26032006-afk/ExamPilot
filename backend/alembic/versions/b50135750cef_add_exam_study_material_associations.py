"""add exam study material associations

Revision ID: b50135750cef
Revises: a77bbe7e9cf3
Create Date: 2026-08-09 16:24:00.883207

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b50135750cef"
down_revision: Union[str, Sequence[str], None] = "a77bbe7e9cf3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "exam_study_materials",

        sa.Column(
            "id",
            sa.Integer(),
            primary_key=True,
            nullable=False,
        ),

        sa.Column(
            "exam_id",
            sa.Integer(),
            nullable=False,
        ),

        sa.Column(
            "document_id",
            sa.Integer(),
            nullable=False,
        ),
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


def downgrade() -> None:
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
