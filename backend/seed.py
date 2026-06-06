"""Datos de prueba para desarrollo local."""
from app import create_app
from app.extensions import db
from app.models import Equipo, Jugador

EQUIPOS = [
    "Lobos UDEA",
    "Tigres UPB",
    "Halcones EAFIT",
    "Cóndores CES",
]

app = create_app()

with app.app_context():
    db.create_all()

    for nombre in EQUIPOS:
        if not Equipo.query.filter_by(nombre=nombre).first():
            equipo = Equipo(nombre=nombre)
            db.session.add(equipo)

    db.session.flush()

    for equipo in Equipo.query.all():
        for i in range(1, 8):
            if not Jugador.query.filter_by(equipo_id=equipo.id, numero_camiseta=i).first():
                db.session.add(
                    Jugador(
                        nombre=f"Jugador {i} ({equipo.nombre[:6]})",
                        numero_camiseta=i,
                        equipo_id=equipo.id,
                    )
                )

    db.session.commit()
    print("Seed completado.")
