import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify

SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret")


def generate_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data["user_id"]
        except Exception as e:
            return jsonify({"message": "Token is invalid!"}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated
