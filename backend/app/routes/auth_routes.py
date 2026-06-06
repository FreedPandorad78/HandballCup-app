import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username", "")
    password = data.get("password", "")

    admin_user = os.environ.get("ADMIN_USERNAME", "organizador")
    admin_pass = os.environ.get("ADMIN_PASSWORD", "")

    if username != admin_user or password != admin_pass:
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_access_token(identity=username)
    return jsonify({"access_token": token}), 200
