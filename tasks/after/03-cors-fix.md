# CORS Fix and Port Change

## Issue
The original CORS error `403 Forbidden` with header `Server: AirTunes` indicated a port conflict on port **5000**. macOS Control Center (AirPlay Receiver) listens on port 5000 by default, intercepting the requests.

## Changes
1. **Backend Port**: Changed backend port from `5000` to `5001` in `backend/main.py` to avoid conflict with macOS system services.
2. **Frontend Config**: Updated `web/src/api.ts` to point to `http://localhost:5001`.
3. **CORS Config**: Maintained the robust CORS configuration:
   - Allowed origins: `http://localhost:5173`, `http://127.0.0.1:5173`
   - `supports_credentials=True`

## Verification
1. Restart the project: `overmind restart`
2. Open the web application at `http://localhost:5173`.
3. The "Backend Status" should display `{"status": "ok"}`.
4. The requests are now directed to port 5001, bypassing the AirPlay conflict.
