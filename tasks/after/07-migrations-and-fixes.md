# Migrations and Fixes

## Changes

### 1. Database User
- Created a new Postgres user `kredit` with full permissions for the `kredit` database.
- Updated `backend/.env` to use the `kredit` user.
- Granted necessary privileges to `kredit` on all tables and sequences.

### 2. Migrations (Alembic)
- Installed `alembic`.
- Initialized Alembic configuration (`alembic init migrations`).
- Configured `backend/migrations/env.py` to:
    - Load environment variables.
    - Connect to the database using SQLAlchemy.
    - Use the shared `Base.metadata` from `models.py`.
- Generated the **Initial migration** (`7bff6dfd6d3f`).
- **Important**: Since the tables already existed, I manually adjusted the migration to `CREATE` tables (to reflect the desired state) and then **stamped** the database (`alembic stamp head`) to mark the migration as applied without running the SQL (which would fail with "table exists").

### 3. Backend Fixes
- Updated `backend/database.py` to use `postgresql+psycopg2` driver explicitly for better stability.
- Exposed `Base` correctly in `models.py` to fix circular import issues during migration generation.

## Running Migrations
For future changes to models:
1. Modify `backend/models.py`.
2. Generate migration: `uv run alembic revision --autogenerate -m "Description"`
3. Apply migration: `uv run alembic upgrade head`
