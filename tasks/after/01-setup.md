# Setup Instructions

## Prerequisites
- Python 3.12+ and uv
- Bun
- Docker (for Postgres)

## Database
Start the Postgres database:

```bash
docker-compose up -d
```

## Backend
1. Navigate to `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already):
   ```bash
   uv sync
   ```
3. Run the development server:
   ```bash
   uv run python main.py
   ```
   The backend will start on http://localhost:5001.

## Web
1. Navigate to `web` directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the development server:
   ```bash
   bun dev
   ```
   The application will be available at http://localhost:5173.

## Notes
- The backend API is at `http://localhost:5001`.
- The web app connects to the backend at `http://localhost:5001`.
- Ensure the database is running before starting the backend.
