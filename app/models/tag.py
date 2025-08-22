from .db import db

class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)

    assets = db.relationship("Asset", secondary="asset_tags", back_populates="tags")

    def to_dict(self, with_assets=True):
        d = {"id": self.id, "name": self.name}
        if with_assets:
            d["assets"] = [a.id for a in self.assets]
        return d
