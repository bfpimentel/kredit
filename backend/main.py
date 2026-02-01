import os
import auth
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db_session, init_db
from models import User, Category, Invoice
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
    supports_credentials=True,
)


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


@app.before_request
def initialize():
    if not getattr(app, "db_initialized", False):
        try:
            init_db()
            setattr(app, "db_initialized", True)
            print("Database initialized successfully.")
        except Exception as e:
            print(f"Error initializing database: {e}")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        token = auth.generate_token(user.id)
        return jsonify({"token": token, "user_id": user.id})

    return jsonify({"message": "Invalid credentials"}), 401


@app.route("/api/categories", methods=["GET", "POST"])
@auth.token_required
def categories(current_user_id):
    if request.method == "POST":
        data = request.get_json()
        name = data.get("name")
        if not name:
            return jsonify({"message": "Name is required"}), 400

        new_category = Category(name=name, user_id=current_user_id)
        db_session.add(new_category)
        db_session.commit()
        return jsonify(new_category.to_dict()), 201

    else:
        user_categories = Category.query.filter_by(user_id=current_user_id).all()
        return jsonify([c.to_dict() for c in user_categories])


@app.route("/api/invoices", methods=["POST"])
@auth.token_required
def upload_invoice(current_user_id):
    if "file" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if file:
        # Here we would process the file and save it
        # For now, just save the metadata to DB
        new_invoice = Invoice(filename=file.filename, user_id=current_user_id)
        db_session.add(new_invoice)
        db_session.commit()

        # In a real app, save the file content to disk or S3

        return jsonify(
            {
                "message": "Invoice uploaded successfully",
                "invoice": new_invoice.to_dict(),
            }
        ), 201


if __name__ == "__main__":
    app.run(debug=True, port=5001)
