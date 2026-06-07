"""Datos de prueba para desarrollo local."""
from app import create_app
from app.extensions import db
from app.models import Categoria, Equipo, Jugador

CATEGORIAS = ["Infantil", "Cadetes"]

EQUIPOS = {
    "Infantil": ["Lobos UDEA", "Tigres UPB"],
    "Cadetes":  ["Halcones EAFIT", "Cóndores CES"],
}

app = create_app()

with app.app_context():
    db.create_all()

    cats = {}
    for nombre in CATEGORIAS:
        c = Categoria.query.filter_by(nombre=nombre).first()
        if not c:
            c = Categoria(nombre=nombre)
            db.session.add(c)
        cats[nombre] = c

    db.session.flush()

    for cat_nombre, equipos in EQUIPOS.items():
        for nombre in equipos:
            if not Equipo.query.filter_by(nombre=nombre).first():
                db.session.add(Equipo(nombre=nombre, categoria_id=cats[cat_nombre].id))

    db.session.flush()

    for equipo in Equipo.query.all():
        for i in range(1, 8):
            if not Jugador.query.filter_by(equipo_id=equipo.id, numero_camiseta=i).first():
                db.session.add(Jugador(
                    nombre=f"Jugador {i} ({equipo.nombre[:6]})",
                    numero_camiseta=i,
                    equipo_id=equipo.id,
                ))

    db.session.commit()
    print("Seed completado.")
