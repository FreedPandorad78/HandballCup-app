from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Categoria

categoria_bp = Blueprint("categorias", __name__)


@categoria_bp.get("/")
def listar_categorias():
    cats = Categoria.query.order_by(Categoria.nombre).all()
    return jsonify([_to_dict(c) for c in cats]), 200


@categoria_bp.post("/")
@jwt_required()
def crear_categoria():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"error": "El campo 'nombre' es obligatorio"}), 400
    if Categoria.query.filter_by(nombre=nombre).first():
        return jsonify({"error": "Ya existe una categoría con ese nombre"}), 409
    cat = Categoria(nombre=nombre)
    db.session.add(cat)
    db.session.commit()
    return jsonify(_to_dict(cat)), 201


@categoria_bp.put("/<string:cat_id>")
@jwt_required()
def actualizar_categoria(cat_id):
    cat = db.get_or_404(Categoria, cat_id)
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"error": "El campo 'nombre' no puede estar vacío"}), 400
    existente = Categoria.query.filter_by(nombre=nombre).first()
    if existente and existente.id != cat_id:
        return jsonify({"error": "Ya existe una categoría con ese nombre"}), 409
    cat.nombre = nombre
    db.session.commit()
    return jsonify(_to_dict(cat)), 200


@categoria_bp.delete("/<string:cat_id>")
@jwt_required()
def eliminar_categoria(cat_id):
    cat = db.get_or_404(Categoria, cat_id)
    db.session.delete(cat)
    db.session.commit()
    return "", 204


def _to_dict(cat: Categoria) -> dict:
    return {"id": cat.id, "nombre": cat.nombre}
