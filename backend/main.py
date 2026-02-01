from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db_session, init_db
from models import User, Category, Invoice, Spending
import auth
from werkzeug.security import generate_password_hash, check_password_hash
import os
import gemini_service
from sqlalchemy import extract

app = Flask(__name__)
# Enable CORS for frontend
CORS(
    app,
    resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
    supports_credentials=True,
)


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()


# Init DB on start
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
        # Check if user has categories, if not create defaults
        if not user.categories:
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
            for cat_name in default_categories:
                db_session.add(Category(name=cat_name, user_id=user.id))
            db_session.commit()

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

        # Check if exists
        existing = Category.query.filter_by(user_id=current_user_id, name=name).first()
        if existing:
            return jsonify({"message": "Category already exists"}), 400

        new_category = Category(name=name, user_id=current_user_id)
        db_session.add(new_category)
        db_session.commit()
        return jsonify(new_category.to_dict()), 201

    else:
        user_categories = Category.query.filter_by(user_id=current_user_id).all()
        return jsonify([c.to_dict() for c in user_categories])


@app.route("/api/categories/<int:category_id>", methods=["DELETE"])
@auth.token_required
def delete_category(current_user_id, category_id):
    category = Category.query.filter_by(id=category_id, user_id=current_user_id).first()
    if not category:
        return jsonify({"message": "Category not found"}), 404

    if category.name == "Other":
        return jsonify({"message": "Cannot delete 'Other' category"}), 403

    # Check if there are spendings associated
    spendings_count = Spending.query.filter_by(category_id=category_id).count()
    if spendings_count > 0:
        # Move spendings to 'Other'
        other_cat = Category.query.filter_by(
            user_id=current_user_id, name="Other"
        ).first()
        if other_cat:
            Spending.query.filter_by(category_id=category_id).update(
                {"category_id": other_cat.id}
            )
        else:
            return jsonify(
                {"message": "'Other' category missing, cannot safely delete"}
            ), 500

    db_session.delete(category)
    db_session.commit()
    return jsonify({"message": "Category deleted successfully"}), 200


@app.route("/api/invoices", methods=["POST"])
@auth.token_required
def upload_invoice(current_user_id):
    if "file" not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"message": "No selected file"}), 400

    if file:
        file_content = file.read()

        # Save invoice metadata
        new_invoice = Invoice(filename=file.filename, user_id=current_user_id)
        db_session.add(new_invoice)
        db_session.commit()

        try:
            # Process with Gemini
            processed_spendings = gemini_service.process_invoice_with_gemini(
                file_content, current_user_id, new_invoice.id
            )

            return jsonify(
                {
                    "message": "Invoice processed successfully",
                    "invoice": new_invoice.to_dict(),
                    "spendings_count": len(processed_spendings),
                }
            ), 201
        except Exception as e:
            print(f"Processing error: {e}")
            return jsonify({"message": f"Error processing invoice: {str(e)}"}), 500


@app.route("/api/spendings", methods=["GET"])
@auth.token_required
def get_spendings(current_user_id):
    month = request.args.get("month")  # Format YYYY-MM

    query = Spending.query.filter_by(user_id=current_user_id)

    if month:
        try:
            year, month_num = map(int, month.split("-"))
            query = query.filter(
                extract("year", Spending.date) == year,
                extract("month", Spending.date) == month_num,
            )
        except ValueError:
            return jsonify({"message": "Invalid month format. Use YYYY-MM"}), 400

    spendings = query.order_by(Spending.date.desc()).all()
    return jsonify([s.to_dict() for s in spendings])


if __name__ == "__main__":
    app.run(debug=True, port=5001)
