from flask import Blueprint, request, jsonify
from app.services.estadisticas_service import tabla_posiciones, goleadores, tarjetas

estadisticas_bp = Blueprint("estadisticas", __name__)


@estadisticas_bp.get("/posiciones")
def posiciones():
    cat = request.args.get("categoria")
    return jsonify(tabla_posiciones(cat)), 200


@estadisticas_bp.get("/goleadores")
def top_goleadores():
    cat = request.args.get("categoria")
    return jsonify(goleadores(cat)), 200


@estadisticas_bp.get("/tarjetas")
def jugadores_tarjetas():
    cat = request.args.get("categoria")
    return jsonify(tarjetas(cat)), 200
