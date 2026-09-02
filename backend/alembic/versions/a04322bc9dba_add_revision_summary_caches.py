"""add revision summary caches

Revision ID: a04322bc9dba
Revises: b50135750cef
Create Date: 2026-08-13 00:42:27.093969

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a04322bc9dba"
down_revision: Union[str, Sequence[str], None] = "b50135750cef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "uploads",
        sa.Column(
            "short_summary",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "uploads",
        sa.Column(
            "detailed_summary",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "uploads",
        sa.Column(
            "exam_focused_summary",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "uploads",
        sa.Column(
            "last_night_summary",
            sa.Text(),
            nullable=True,
        ),
    )

    op.drop_column(
        "uploads",
        "summary",
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.add_column(
        "uploads",
        sa.Column(
            "summary",
            sa.Text(),
            nullable=True,
        ),
    )

    op.drop_column(
        "uploads",
        "last_night_summary",
    )

    op.drop_column(
        "uploads",
        "exam_focused_summary",
    )

    op.drop_column(
        "uploads",
        "detailed_summary",
    )

    op.drop_column(
        "uploads",
        "short_summary",
    )
