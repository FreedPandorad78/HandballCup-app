import uuid
from datetime import datetime, timezone
from app.extensions import db


class Categoria(db.Model):
    __tablename__ = "categorias"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = db.Column(db.String(50), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    equipos = db.relationship("Equipo", back_populates="categoria", lazy="dynamic")
    partidos = db.relationship("Partido", back_populates="categoria", lazy="dynamic")

    def __repr__(self):
        return f"<Categoria {self.nombre}>"
