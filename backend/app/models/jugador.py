import uuid
from app.extensions import db


class Jugador(db.Model):
    __tablename__ = "jugadores"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = db.Column(db.String(100), nullable=False)
    numero_camiseta = db.Column(db.Integer, nullable=False)
    equipo_id = db.Column(db.String(36), db.ForeignKey("equipos.id"), nullable=False)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    equipo = db.relationship("Equipo", back_populates="jugadores")
    eventos = db.relationship("Evento", back_populates="jugador")

    __table_args__ = (
        db.UniqueConstraint("equipo_id", "numero_camiseta", name="uq_equipo_numero"),
    )

    def __repr__(self):
        return f"<Jugador {self.nombre} #{self.numero_camiseta}>"
