import uuid
from datetime import datetime, timezone
from app.extensions import db


class Equipo(db.Model):
    __tablename__ = "equipos"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    logo_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    jugadores = db.relationship("Jugador", back_populates="equipo", lazy="dynamic")
    partidos_local = db.relationship(
        "Partido", foreign_keys="Partido.equipo_local_id", back_populates="equipo_local"
    )
    partidos_visitante = db.relationship(
        "Partido",
        foreign_keys="Partido.equipo_visitante_id",
        back_populates="equipo_visitante",
    )

    def __repr__(self):
        return f"<Equipo {self.nombre}>"
