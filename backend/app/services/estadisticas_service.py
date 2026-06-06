from sqlalchemy import func, case
from app.extensions import db
from app.models.equipo import Equipo
from app.models.jugador import Jugador
from app.models.partido import Partido
from app.models.evento import Evento


def tabla_posiciones() -> list:
    """Returns standings for all teams based on FINALIZADO partidos.

    Points: win=2, draw=1, loss=0.
    Order: pts DESC, gd DESC, gf DESC, nombre ASC.
    """
    equipos = Equipo.query.order_by(Equipo.nombre).all()
    partidos = Partido.query.filter_by(estado="FINALIZADO").all()

    stats = {
        e.id: {
            "pos": 0,
            "id": e.id,
            "nombre": e.nombre,
            "logo_url": e.logo_url,
            "pj": 0, "pg": 0, "pe": 0, "pp": 0,
            "gf": 0, "gc": 0, "gd": 0, "pts": 0,
        }
        for e in equipos
    }

    for p in partidos:
        lid = p.equipo_local_id
        vid = p.equipo_visitante_id
        if lid not in stats or vid not in stats:
            continue

        stats[lid]["pj"] += 1
        stats[lid]["gf"] += p.goles_local
        stats[lid]["gc"] += p.goles_visitante

        stats[vid]["pj"] += 1
        stats[vid]["gf"] += p.goles_visitante
        stats[vid]["gc"] += p.goles_local

        if p.goles_local > p.goles_visitante:
            stats[lid]["pg"] += 1
            stats[vid]["pp"] += 1
        elif p.goles_local < p.goles_visitante:
            stats[vid]["pg"] += 1
            stats[lid]["pp"] += 1
        else:
            stats[lid]["pe"] += 1
            stats[vid]["pe"] += 1

    rows = list(stats.values())
    for r in rows:
        r["gd"] = r["gf"] - r["gc"]
        r["pts"] = r["pg"] * 2 + r["pe"]

    rows.sort(key=lambda x: (-x["pts"], -x["gd"], -x["gf"], x["nombre"]))
    for i, r in enumerate(rows, 1):
        r["pos"] = i

    return rows


def goleadores() -> list:
    """Returns players ordered by number of goals (GOL events)."""
    rows = (
        db.session.query(
            Jugador.id,
            Jugador.nombre,
            Jugador.numero_camiseta,
            Equipo.nombre.label("equipo"),
            func.count(Evento.id).label("goles"),
        )
        .join(Evento, Evento.jugador_id == Jugador.id)
        .join(Equipo, Equipo.id == Jugador.equipo_id)
        .filter(Evento.tipo == "GOL")
        .group_by(Jugador.id, Jugador.nombre, Jugador.numero_camiseta, Equipo.nombre)
        .order_by(func.count(Evento.id).desc())
        .all()
    )
    return [
        {
            "jugador_id": r.id,
            "nombre": r.nombre,
            "numero_camiseta": r.numero_camiseta,
            "equipo": r.equipo,
            "goles": r.goles,
        }
        for r in rows
    ]


def tarjetas() -> list:
    """Returns players with cards, ordered by rojas DESC then amarillas DESC."""
    amarillas_col = func.sum(
        case((Evento.tipo == "TARJETA_AMARILLA", 1), else_=0)
    ).label("amarillas")
    rojas_col = func.sum(
        case((Evento.tipo == "TARJETA_ROJA", 1), else_=0)
    ).label("rojas")

    rows = (
        db.session.query(
            Jugador.id,
            Jugador.nombre,
            Jugador.numero_camiseta,
            Equipo.nombre.label("equipo"),
            amarillas_col,
            rojas_col,
        )
        .join(Evento, Evento.jugador_id == Jugador.id)
        .join(Equipo, Equipo.id == Jugador.equipo_id)
        .filter(Evento.tipo.in_(["TARJETA_AMARILLA", "TARJETA_ROJA"]))
        .group_by(Jugador.id, Jugador.nombre, Jugador.numero_camiseta, Equipo.nombre)
        .order_by(rojas_col.desc(), amarillas_col.desc())
        .all()
    )
    return [
        {
            "jugador_id": r.id,
            "nombre": r.nombre,
            "numero_camiseta": r.numero_camiseta,
            "equipo": r.equipo,
            "amarillas": r.amarillas,
            "rojas": r.rojas,
        }
        for r in rows
    ]
