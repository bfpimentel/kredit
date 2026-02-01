# Post-setup Instructions

## Changes
- **Database**: Switched from Docker to local Postgres.
- **Runner**: Added `overmind` support via `Procfile`.

## Prerequisites
- **Overmind**: `brew install overmind` (if not installed)
- **Postgres 17**: Must be installed and running locally.
- **Python/uv** & **Bun**

## Configuration
The backend is configured to connect to the local Postgres database `kredit` using the current system user (`bruno` or similar) with no password.
If your local Postgres setup requires a password, update `backend/.env`.

## Running the Project
To start both the backend and web frontend:

```bash
overmind start
```

- **Backend**: http://localhost:5001
- **Web**: http://localhost:5173
