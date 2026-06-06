from flask import Blueprint, jsonify
from app.services.estadisticas_service import tabla_posiciones, goleadores, tarjetas

estadisticas_bp = Blueprint("estadisticas", __name__)


@estadisticas_bp.get("/posiciones")
def posiciones():
    return jsonify(tabla_posiciones()), 200


@estadisticas_bp.get("/goleadores")
def top_goleadores():
    return jsonify(goleadores()), 200


@estadisticas_bp.get("/tarjetas")
def jugadores_tarjetas():
    return jsonify(tarjetas()), 200
