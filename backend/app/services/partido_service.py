from app.extensions import db
from app.models.partido import Partido
from app.models.evento import Evento

TRANSICIONES_VALIDAS = {
    "PROGRAMADO": "EN_CURSO",
    "EN_CURSO": "FINALIZADO",
}


def recalcular_goles(partido: Partido) -> None:
    """Recounts GOL events and updates partido.goles_local / goles_visitante.

    Must be called after db.session.flush() so the session reflects the
    pending insert or delete before we count.
    """
    partido.goles_local = Evento.query.filter_by(
        partido_id=partido.id,
        equipo_id=partido.equipo_local_id,
        tipo="GOL",
    ).count()
    partido.goles_visitante = Evento.query.filter_by(
        partido_id=partido.id,
        equipo_id=partido.equipo_visitante_id,
        tipo="GOL",
    ).count()


def cambiar_estado(partido: Partido, nuevo_estado: str):
    """Returns (ok: bool, error: str | None).

    Allowed transitions: PROGRAMADO → EN_CURSO → FINALIZADO.
    """
    if nuevo_estado not in Partido.ESTADOS:
        return False, f"Estado inválido. Válidos: {Partido.ESTADOS}"

    siguiente = TRANSICIONES_VALIDAS.get(partido.estado)
    if siguiente != nuevo_estado:
        return False, f"No se puede pasar de '{partido.estado}' a '{nuevo_estado}'"

    partido.estado = nuevo_estado
    return True, None
