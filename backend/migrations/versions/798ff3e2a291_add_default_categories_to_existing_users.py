"""Add default categories to existing users

Revision ID: 798ff3e2a291
Revises: 7bff6dfd6d3f
Create Date: 2026-02-01 11:35:55.184803

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column, select

# revision identifiers, used by Alembic.
revision: str = "798ff3e2a291"
down_revision: Union[str, Sequence[str], None] = "7bff6dfd6d3f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Define table structures for data manipulation
    users_table = table("users", column("id", sa.Integer))
    categories_table = table(
        "categories", column("name", sa.String), column("user_id", sa.Integer)
    )

    connection = op.get_bind()

    # Get all user IDs
    users = connection.execute(select(users_table.c.id)).fetchall()

    default_categories = [
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Bills & Utilities",
        "Health & Fitness",
        "Travel",
        "Education",
        "Personal Care",
        "Other",
    ]

    for user in users:
        user_id = user[0]

        # Check if user has any categories
        existing_count = connection.execute(
            select(sa.func.count())
            .select_from(categories_table)
            .where(categories_table.c.user_id == user_id)
        ).scalar()

        if existing_count == 0:
            # Insert default categories
            op.bulk_insert(
                categories_table,
                [{"name": cat, "user_id": user_id} for cat in default_categories],
            )


def downgrade() -> None:
    """Downgrade schema."""
    # We generally don't delete data in downgrade unless strictly necessary,
    # but strictly speaking we could remove categories that match the defaults.
    # However, user might have used them. It's safer to do nothing.
    pass
