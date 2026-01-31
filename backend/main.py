from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import db
import auth
from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2.extras import RealDictCursor
import os

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
    supports_credentials=True,
)

DB_INITIALIZED = False


# Init DB on start
# In a real app, use migration tools like Alembic or Flask-Migrate
@app.before_request
def initialize():
    global DB_INITIALIZED
    if not DB_INITIALIZED:
        try:
            db.init_db()
            DB_INITIALIZED = True
            print("Database initialized successfully.")
        except Exception as e:
            print(f"Error initializing database: {e}")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    hashed_password = generate_password_hash(password)

    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s) RETURNING id",
            (username, hashed_password),
        )
        result = cur.fetchone()
        if result:
            user_id = result[0]
            conn.commit()

            token = auth.generate_token(user_id)
            return jsonify({"token": token, "user_id": user_id}), 201
        else:
            conn.rollback()
            return jsonify({"message": "Registration failed"}), 500
    except Exception as e:
        if conn:
            conn.rollback()
        print(e)
        return jsonify({"message": "User already exists or error"}), 400
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = None
    cur = None
    try:
        conn = db.get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()

        if user and check_password_hash(user["password"], password):
            token = auth.generate_token(user["id"])
            return jsonify({"token": token, "user_id": user["id"]})
    except Exception as e:
        print(e)
        return jsonify({"message": "Database error"}), 500
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

    return jsonify({"message": "Invalid credentials"}), 401


@app.route("/api/protected", methods=["GET"])
@auth.token_required
def protected(current_user_id):
    return jsonify(
        {"message": f"Hello user {current_user_id}, this is protected data."}
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
