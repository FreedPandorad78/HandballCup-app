from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Evento, Partido, Jugador, Equipo
from app.services.partido_service import recalcular_goles

evento_bp = Blueprint("eventos", __name__)


@evento_bp.get("/")
def listar_eventos():
    partido_id = request.args.get("partido")
    if not partido_id:
        return jsonify({"error": "El parámetro ?partido=<id> es obligatorio"}), 400

    db.get_or_404(Partido, partido_id)
    eventos = (
        Evento.query.filter_by(partido_id=partido_id)
        .order_by(Evento.minuto)
        .all()
    )
    return jsonify([_to_dict(e) for e in eventos]), 200


@evento_bp.post("/")
@jwt_required()
def registrar_evento():
    data = request.get_json(silent=True) or {}

    partido_id = data.get("partido_id", "")
    equipo_id = data.get("equipo_id", "")
    tipo = (data.get("tipo") or "").strip().upper()
    minuto = data.get("minuto")
    jugador_id = data.get("jugador_id")  # nullable (ej. gol en propia puerta)

    if not partido_id:
        return jsonify({"error": "El campo 'partido_id' es obligatorio"}), 400
    if not equipo_id:
        return jsonify({"error": "El campo 'equipo_id' es obligatorio"}), 400
    if tipo not in Evento.TIPOS:
        return jsonify({"error": f"Tipo inválido. Válidos: {Evento.TIPOS}"}), 400
    if minuto is None:
        return jsonify({"error": "El campo 'minuto' es obligatorio"}), 400

    partido = db.get_or_404(Partido, partido_id)

    if partido.estado != "EN_CURSO":
        return jsonify({"error": "Solo se pueden registrar eventos en partidos EN_CURSO"}), 409

    if equipo_id not in (partido.equipo_local_id, partido.equipo_visitante_id):
        return jsonify({"error": "El equipo no pertenece a este partido"}), 400

    db.get_or_404(Equipo, equipo_id)

    if jugador_id:
        jugador = db.get_or_404(Jugador, jugador_id)
        if jugador.equipo_id != equipo_id:
            return jsonify({"error": "El jugador no pertenece al equipo indicado"}), 400

    evento = Evento(
        partido_id=partido_id,
        equipo_id=equipo_id,
        jugador_id=jugador_id,
        tipo=tipo,
        minuto=int(minuto),
    )
    db.session.add(evento)
    db.session.flush()

    if tipo == "GOL":
        recalcular_goles(partido)

    db.session.commit()
    return jsonify(_to_dict(evento)), 201


@evento_bp.delete("/<string:evento_id>")
@jwt_required()
def deshacer_evento(evento_id):
    evento = db.get_or_404(Evento, evento_id)
    partido = evento.partido
    tipo = evento.tipo

    db.session.delete(evento)
    db.session.flush()

    if tipo == "GOL":
        recalcular_goles(partido)

    db.session.commit()
    return "", 204


def _to_dict(evento: Evento) -> dict:
    return {
        "id": evento.id,
        "partido_id": evento.partido_id,
        "jugador_id": evento.jugador_id,
        "equipo_id": evento.equipo_id,
        "tipo": evento.tipo,
        "minuto": evento.minuto,
        "created_at": evento.created_at.isoformat() if evento.created_at else None,
    }
