import uuid
from datetime import datetime, timezone
from app.extensions import db


class Partido(db.Model):
    __tablename__ = "partidos"

    ESTADOS = ("PROGRAMADO", "EN_CURSO", "FINALIZADO")

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    equipo_local_id = db.Column(
        db.String(36), db.ForeignKey("equipos.id"), nullable=False
    )
    equipo_visitante_id = db.Column(
        db.String(36), db.ForeignKey("equipos.id"), nullable=False
    )
    fecha = db.Column(db.DateTime, nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="PROGRAMADO")
    goles_local = db.Column(db.Integer, default=0, nullable=False)
    goles_visitante = db.Column(db.Integer, default=0, nullable=False)
    fase = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    equipo_local = db.relationship(
        "Equipo", foreign_keys=[equipo_local_id], back_populates="partidos_local"
    )
    equipo_visitante = db.relationship(
        "Equipo",
        foreign_keys=[equipo_visitante_id],
        back_populates="partidos_visitante",
    )
    eventos = db.relationship(
        "Evento", back_populates="partido", cascade="all, delete-orphan"
    )

    __table_args__ = (
        db.CheckConstraint(
            "equipo_local_id != equipo_visitante_id", name="ck_equipos_diferentes"
        ),
    )

    def __repr__(self):
        return f"<Partido {self.equipo_local_id} vs {self.equipo_visitante_id}>"
