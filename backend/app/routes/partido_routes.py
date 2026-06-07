from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models import Partido, Equipo
from app.services.partido_service import cambiar_estado

partido_bp = Blueprint("partidos", __name__)


@partido_bp.get("/")
def listar_partidos():
    categoria_id = request.args.get("categoria")
    query = Partido.query
    if categoria_id:
        query = query.filter_by(categoria_id=categoria_id)
    partidos = query.order_by(Partido.fecha).all()
    return jsonify([_to_dict(p) for p in partidos]), 200


@partido_bp.get("/<string:partido_id>")
def obtener_partido(partido_id):
    partido = db.get_or_404(Partido, partido_id)
    return jsonify(_to_dict(partido, include_eventos=True)), 200


@partido_bp.post("/")
@jwt_required()
def crear_partido():
    data = request.get_json(silent=True) or {}
    local_id = data.get("equipo_local_id", "")
    visitante_id = data.get("equipo_visitante_id", "")
    fecha_str = data.get("fecha", "")
    fase = (data.get("fase") or "").strip()

    if not local_id or not visitante_id:
        return jsonify({"error": "equipo_local_id y equipo_visitante_id son obligatorios"}), 400
    if local_id == visitante_id:
        return jsonify({"error": "Un partido no puede tener dos equipos iguales"}), 400
    if not fecha_str:
        return jsonify({"error": "El campo 'fecha' es obligatorio (ISO 8601)"}), 400
    if not fase:
        return jsonify({"error": "El campo 'fase' es obligatorio"}), 400

    local = db.get_or_404(Equipo, local_id)
    db.get_or_404(Equipo, visitante_id)

    if local.categoria_id:
        visitante = Equipo.query.get(visitante_id)
        if visitante and visitante.categoria_id and visitante.categoria_id != local.categoria_id:
            return jsonify({"error": "Los equipos deben pertenecer a la misma categoría"}), 400

    try:
        fecha = datetime.fromisoformat(fecha_str)
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido. Use ISO 8601"}), 400

    partido = Partido(
        equipo_local_id=local_id,
        equipo_visitante_id=visitante_id,
        fecha=fecha,
        fase=fase,
        categoria_id=local.categoria_id,
    )
    db.session.add(partido)
    db.session.commit()
    return jsonify(_to_dict(partido)), 201


@partido_bp.put("/<string:partido_id>")
@jwt_required()
def actualizar_partido(partido_id):
    partido = db.get_or_404(Partido, partido_id)
    data = request.get_json(silent=True) or {}

    if "fecha" in data:
        try:
            partido.fecha = datetime.fromisoformat(data["fecha"])
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido"}), 400

    if "fase" in data:
        fase = data["fase"].strip()
        if not fase:
            return jsonify({"error": "El campo 'fase' no puede estar vacío"}), 400
        partido.fase = fase

    db.session.commit()
    return jsonify(_to_dict(partido)), 200


@partido_bp.patch("/<string:partido_id>/estado")
@jwt_required()
def cambiar_estado_partido(partido_id):
    partido = db.get_or_404(Partido, partido_id)
    data = request.get_json(silent=True) or {}
    nuevo_estado = (data.get("estado") or "").strip().upper()

    ok, error = cambiar_estado(partido, nuevo_estado)
    if not ok:
        return jsonify({"error": error}), 400

    db.session.commit()
    return jsonify(_to_dict(partido)), 200


@partido_bp.delete("/<string:partido_id>")
@jwt_required()
def eliminar_partido(partido_id):
    partido = db.get_or_404(Partido, partido_id)
    db.session.delete(partido)
    db.session.commit()
    return "", 204


def _to_dict(partido: Partido, include_eventos: bool = False) -> dict:
    d = {
        "id": partido.id,
        "categoria_id": partido.categoria_id,
        "categoria": partido.categoria.nombre if partido.categoria else None,
        "equipo_local_id": partido.equipo_local_id,
        "equipo_local": partido.equipo_local.nombre,
        "equipo_visitante_id": partido.equipo_visitante_id,
        "equipo_visitante": partido.equipo_visitante.nombre,
        "fecha": partido.fecha.isoformat() if partido.fecha else None,
        "estado": partido.estado,
        "goles_local": partido.goles_local,
        "goles_visitante": partido.goles_visitante,
        "fase": partido.fase,
        "created_at": partido.created_at.isoformat() if partido.created_at else None,
    }
    if include_eventos:
        eventos_ordenados = sorted(partido.eventos, key=lambda e: e.minuto)
        d["eventos"] = [
            {
                "id": e.id,
                "tipo": e.tipo,
                "minuto": e.minuto,
                "jugador_id": e.jugador_id,
                "equipo_id": e.equipo_id,
            }
            for e in eventos_ordenados
        ]
    return d
