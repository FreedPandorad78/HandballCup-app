from typing import Optional
from sqlalchemy import func, case
from app.extensions import db
from app.models.equipo import Equipo
from app.models.jugador import Jugador
from app.models.partido import Partido
from app.models.evento import Evento


def tabla_posiciones(categoria_id: Optional[str] = None) -> list:
    eq_q = Equipo.query
    pt_q = Partido.query.filter_by(estado="FINALIZADO")
    if categoria_id:
        eq_q = eq_q.filter_by(categoria_id=categoria_id)
        pt_q = pt_q.filter_by(categoria_id=categoria_id)

    equipos = eq_q.order_by(Equipo.nombre).all()
    partidos = pt_q.all()

    stats = {
        e.id: {
            "pos": 0, "id": e.id, "nombre": e.nombre, "logo_url": e.logo_url,
            "pj": 0, "pg": 0, "pe": 0, "pp": 0,
            "gf": 0, "gc": 0, "gd": 0, "pts": 0,
        }
        for e in equipos
    }

    for p in partidos:
        lid, vid = p.equipo_local_id, p.equipo_visitante_id
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


def goleadores(categoria_id: Optional[str] = None) -> list:
    q = (
        db.session.query(
            Jugador.id, Jugador.nombre, Jugador.numero_camiseta,
            Equipo.nombre.label("equipo"),
            func.count(Evento.id).label("goles"),
        )
        .join(Evento, Evento.jugador_id == Jugador.id)
        .join(Equipo, Equipo.id == Jugador.equipo_id)
        .filter(Evento.tipo == "GOL")
    )
    if categoria_id:
        q = q.filter(Equipo.categoria_id == categoria_id)
    rows = q.group_by(
        Jugador.id, Jugador.nombre, Jugador.numero_camiseta, Equipo.nombre
    ).order_by(func.count(Evento.id).desc()).all()
    return [
        {"jugador_id": r.id, "nombre": r.nombre,
         "numero_camiseta": r.numero_camiseta, "equipo": r.equipo, "goles": r.goles}
        for r in rows
    ]


def tarjetas(categoria_id: Optional[str] = None) -> list:
    amarillas_col = func.sum(case((Evento.tipo == "TARJETA_AMARILLA", 1), else_=0)).label("amarillas")
    rojas_col = func.sum(case((Evento.tipo == "TARJETA_ROJA", 1), else_=0)).label("rojas")

    q = (
        db.session.query(
            Jugador.id, Jugador.nombre, Jugador.numero_camiseta,
            Equipo.nombre.label("equipo"),
            amarillas_col, rojas_col,
        )
        .join(Evento, Evento.jugador_id == Jugador.id)
        .join(Equipo, Equipo.id == Jugador.equipo_id)
        .filter(Evento.tipo.in_(["TARJETA_AMARILLA", "TARJETA_ROJA"]))
    )
    if categoria_id:
        q = q.filter(Equipo.categoria_id == categoria_id)
    rows = q.group_by(
        Jugador.id, Jugador.nombre, Jugador.numero_camiseta, Equipo.nombre
    ).order_by(rojas_col.desc(), amarillas_col.desc()).all()
    return [
        {"jugador_id": r.id, "nombre": r.nombre,
         "numero_camiseta": r.numero_camiseta, "equipo": r.equipo,
         "amarillas": r.amarillas, "rojas": r.rojas}
        for r in rows
    ]
