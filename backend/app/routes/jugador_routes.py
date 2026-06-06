from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Jugador, Equipo

jugador_bp = Blueprint("jugadores", __name__)


@jugador_bp.get("/")
def listar_jugadores():
    equipo_id = request.args.get("equipo")
    query = Jugador.query
    if equipo_id:
        query = query.filter_by(equipo_id=equipo_id)
    jugadores = query.order_by(Jugador.numero_camiseta).all()
    return jsonify([_to_dict(j) for j in jugadores]), 200


@jugador_bp.get("/<string:jugador_id>")
def obtener_jugador(jugador_id):
    jugador = db.get_or_404(Jugador, jugador_id)
    return jsonify(_to_dict(jugador)), 200


@jugador_bp.post("/")
@jwt_required()
def crear_jugador():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()
    equipo_id = data.get("equipo_id", "")
    numero = data.get("numero_camiseta")

    if not nombre:
        return jsonify({"error": "El campo 'nombre' es obligatorio"}), 400
    if not equipo_id:
        return jsonify({"error": "El campo 'equipo_id' es obligatorio"}), 400
    if numero is None:
        return jsonify({"error": "El campo 'numero_camiseta' es obligatorio"}), 400

    db.get_or_404(Equipo, equipo_id)

    if Jugador.query.filter_by(equipo_id=equipo_id, numero_camiseta=numero).first():
        return jsonify({"error": "Ese número de camiseta ya existe en el equipo"}), 409

    jugador = Jugador(
        nombre=nombre,
        numero_camiseta=int(numero),
        equipo_id=equipo_id,
        activo=data.get("activo", True),
    )
    db.session.add(jugador)
    db.session.commit()
    return jsonify(_to_dict(jugador)), 201


@jugador_bp.put("/<string:jugador_id>")
@jwt_required()
def actualizar_jugador(jugador_id):
    jugador = db.get_or_404(Jugador, jugador_id)
    data = request.get_json(silent=True) or {}

    if "nombre" in data:
        nombre = data["nombre"].strip()
        if not nombre:
            return jsonify({"error": "El campo 'nombre' no puede estar vacío"}), 400
        jugador.nombre = nombre

    if "numero_camiseta" in data:
        numero = int(data["numero_camiseta"])
        conflicto = Jugador.query.filter_by(
            equipo_id=jugador.equipo_id, numero_camiseta=numero
        ).first()
        if conflicto and conflicto.id != jugador_id:
            return jsonify({"error": "Ese número ya existe en el equipo"}), 409
        jugador.numero_camiseta = numero

    if "activo" in data:
        jugador.activo = bool(data["activo"])

    db.session.commit()
    return jsonify(_to_dict(jugador)), 200


@jugador_bp.delete("/<string:jugador_id>")
@jwt_required()
def eliminar_jugador(jugador_id):
    jugador = db.get_or_404(Jugador, jugador_id)
    db.session.delete(jugador)
    db.session.commit()
    return "", 204


def _to_dict(jugador: Jugador) -> dict:
    return {
        "id": jugador.id,
        "nombre": jugador.nombre,
        "numero_camiseta": jugador.numero_camiseta,
        "equipo_id": jugador.equipo_id,
        "activo": jugador.activo,
    }
