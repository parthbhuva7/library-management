"""Initial schema with books, book_copies, members, borrows, staff_users.

Revision ID: 001
Revises:
Create Date: 2025-02-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial tables."""
    op.create_table(
        "books",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("author", sa.String(255), nullable=False),
        sa.Column("isbn", sa.String(20), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "book_copies",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("book_id", sa.String(26), sa.ForeignKey("books.id"), nullable=False),
        sa.Column("copy_number", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="available"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_book_copies_book_id", "book_copies", ["book_id"])
    op.create_index("ix_book_copies_status", "book_copies", ["status"])

    op.create_table(
        "members",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_members_email", "members", ["email"], unique=True)

    op.create_table(
        "staff_users",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column("username", sa.String(100), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_staff_users_username", "staff_users", ["username"], unique=True)

    op.create_table(
        "borrows",
        sa.Column("id", sa.String(26), primary_key=True),
        sa.Column(
            "copy_id",
            sa.String(26),
            sa.ForeignKey("book_copies.id"),
            nullable=False,
        ),
        sa.Column(
            "member_id",
            sa.String(26),
            sa.ForeignKey("members.id"),
            nullable=False,
        ),
        sa.Column(
            "borrowed_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column("returned_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="active"),
    )
    op.create_index("ix_borrows_copy_id", "borrows", ["copy_id"])
    op.create_index("ix_borrows_member_id", "borrows", ["member_id"])
    op.create_index("ix_borrows_status", "borrows", ["status"])


def downgrade() -> None:
    """Drop all tables."""
    op.drop_table("borrows")
    op.drop_table("staff_users")
    op.drop_table("members")
    op.drop_table("book_copies")
    op.drop_table("books")
