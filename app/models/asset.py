from .db import db
from sqlalchemy.sql import func

asset_tags = db.Table(
    "asset_tags",
    db.Column("asset_id", db.Integer, db.ForeignKey("assets.id"), primary_key=True),
    db.Column("tag_id", db.Integer, db.ForeignKey("tags.id"), primary_key=True),
)

class Asset(db.Model):
    __tablename__ = "assets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    url = db.Column(db.String(2048))
    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, onupdate=func.now())

    tags = db.relationship("Tag", secondary=asset_tags, back_populates="assets")

    def to_dict(self, with_tags=True):
        d = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "url": self.url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if with_tags:
            d["tags"] = [t.to_dict(with_assets=False) for t in self.tags]
        return d
