import uuid
from datetime import datetime, timezone
from app.extensions import db


class Evento(db.Model):
    __tablename__ = "eventos"

    TIPOS = ("GOL", "TARJETA_AMARILLA", "TARJETA_ROJA", "TIEMPO_FUERA")

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    partido_id = db.Column(
        db.String(36), db.ForeignKey("partidos.id"), nullable=False
    )
    jugador_id = db.Column(
        db.String(36), db.ForeignKey("jugadores.id"), nullable=True
    )
    equipo_id = db.Column(
        db.String(36), db.ForeignKey("equipos.id"), nullable=False
    )
    tipo = db.Column(db.String(20), nullable=False)
    minuto = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    partido = db.relationship("Partido", back_populates="eventos")
    jugador = db.relationship("Jugador", back_populates="eventos")
    equipo = db.relationship("Equipo")

    def __repr__(self):
        return f"<Evento {self.tipo} min.{self.minuto}>"
