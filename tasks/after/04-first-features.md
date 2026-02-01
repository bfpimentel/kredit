# First Features Implementation

## Changes

### Backend
- **ORM**: Replaced raw SQL with **SQLAlchemy**.
- **Models**: Created `User`, `Category`, and `Invoice` models.
- **Endpoints**:
  - `POST /auth/login`: Authenticates users.
  - `GET/POST /api/categories`: Manages spending categories.
  - `POST /api/invoices`: Handles invoice uploads (metadata only for now).
- **Database**: Updated `database.py` to handle connections via SQLAlchemy.

### Frontend
- **Routing**: Implemented **React Router** with protected routes.
- **Auth**: Created `AuthContext` to manage JWT tokens and user session.
- **UI**:
  - **Login Page**: Simple username/password form.
  - **Sidebar Layout**: Navigation for Dashboard, Categories, and Import.
  - **Categories Page**: List and add categories.
  - **Import Page**: File upload interface for invoices.

## Creating a User
Since there is no sign-up page, you need to create a user manually via the Python shell.

1. Open the backend shell:
   ```bash
   cd backend
   uv run python
   ```

2. Run the following commands:
   ```python
   from database import db_session
   from models import User
   from werkzeug.security import generate_password_hash

   # Create user
   username = "admin"
   password = "password"
   hashed_password = generate_password_hash(password)
   
   new_user = User(username=username, password=hashed_password)
   db_session.add(new_user)
   db_session.commit()
   
   print(f"User {username} created with ID: {new_user.id}")
   ```

3. You can now login with `admin` / `password`.
