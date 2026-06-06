from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Equipo

equipo_bp = Blueprint("equipos", __name__)


@equipo_bp.get("/")
def listar_equipos():
    equipos = Equipo.query.order_by(Equipo.nombre).all()
    return jsonify([_to_dict(e) for e in equipos]), 200


@equipo_bp.get("/<string:equipo_id>")
def obtener_equipo(equipo_id):
    equipo = db.get_or_404(Equipo, equipo_id)
    return jsonify(_to_dict(equipo)), 200


@equipo_bp.post("/")
@jwt_required()
def crear_equipo():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"error": "El campo 'nombre' es obligatorio"}), 400

    if Equipo.query.filter_by(nombre=nombre).first():
        return jsonify({"error": "Ya existe un equipo con ese nombre"}), 409

    equipo = Equipo(nombre=nombre, logo_url=data.get("logo_url"))
    db.session.add(equipo)
    db.session.commit()
    return jsonify(_to_dict(equipo)), 201


@equipo_bp.put("/<string:equipo_id>")
@jwt_required()
def actualizar_equipo(equipo_id):
    equipo = db.get_or_404(Equipo, equipo_id)
    data = request.get_json(silent=True) or {}

    if "nombre" in data:
        nombre = data["nombre"].strip()
        if not nombre:
            return jsonify({"error": "El campo 'nombre' no puede estar vacío"}), 400
        existente = Equipo.query.filter_by(nombre=nombre).first()
        if existente and existente.id != equipo_id:
            return jsonify({"error": "Ya existe un equipo con ese nombre"}), 409
        equipo.nombre = nombre

    if "logo_url" in data:
        equipo.logo_url = data["logo_url"]

    db.session.commit()
    return jsonify(_to_dict(equipo)), 200


@equipo_bp.delete("/<string:equipo_id>")
@jwt_required()
def eliminar_equipo(equipo_id):
    equipo = db.get_or_404(Equipo, equipo_id)
    db.session.delete(equipo)
    db.session.commit()
    return "", 204


def _to_dict(equipo: Equipo) -> dict:
    return {
        "id": equipo.id,
        "nombre": equipo.nombre,
        "logo_url": equipo.logo_url,
        "created_at": equipo.created_at.isoformat() if equipo.created_at else None,
    }
