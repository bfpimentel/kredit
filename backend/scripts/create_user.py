from database import db_session
from models import User
from werkzeug.security import generate_password_hash

username = "admin"
password = "admin"
hashed_password = generate_password_hash(password)

new_user = User(username=username, password=hashed_password)
db_session.add(new_user)
db_session.commit()

print(f"User {username} created with ID: {new_user.id}")
