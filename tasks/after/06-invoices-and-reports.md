# Invoices and Reports Features

## Changes

### Backend
- **Gemini Integration**: Used the new `google-genai` SDK to process PDF invoices and extract spending data.
- **Models**: Updated `Spending`, `Invoice`, and `Category` models to support the new features.
- **API Endpoints**:
    - `POST /api/invoices`: Now processes the file with Gemini and saves extracted spendings.
    - `GET /api/spendings`: Lists spendings with optional month filtering.
    - `DELETE /api/categories/:id`: Allows deleting categories (spendings moved to "Other").
    - `POST /auth/login`: Ensures default categories exist for the user.
- **Configuration**: Added `GEMINI_API_KEY` handling in `.env`.

### Frontend
- **Dashboard**: Added Bar and Pie charts to visualize spendings by category.
- **Spendings Page**: New page to list detailed spendings with month filtering.
- **Import Page**: Enhanced with loading states and AI processing feedback.
- **Categories Page**: Added delete functionality (protecting "Other").

## Configuration
To use the invoice processing feature, you must set the `GEMINI_API_KEY` in `backend/.env`.

```bash
GEMINI_API_KEY=your_api_key_here
```

## Running the Project
Restart the project to apply database schema changes and load new dependencies:

```bash
overmind restart
```
