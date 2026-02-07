"""
재료(Ingredient) 모델
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class Ingredient(Base):
    """재료 모델"""
    __tablename__ = "ingredients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    quantity = Column(String)  # "2개", "500g" 등
    unit = Column(String)
    freshness = Column(String)  # fresh, moderate, expiring
    confidence = Column(Float)  # 0.0 ~ 1.0

    # 이미지 관계
    image_id = Column(String, ForeignKey("image_uploads.id"))
    image = relationship("ImageUpload", back_populates="ingredients")

    # 메타데이터
    detected_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Ingredient {self.name}>"

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "id": self.id,
            "name": self.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "freshness": self.freshness,
            "confidence": self.confidence,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None
        }
