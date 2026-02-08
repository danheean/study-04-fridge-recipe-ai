"""
이미지 업로드(ImageUpload) 모델
"""
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class ImageUpload(Base):
    """이미지 업로드 모델"""
    __tablename__ = "image_uploads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    image_url = Column(String)  # 저장된 이미지 경로 (추후 구현)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # 관계 (selectin 로딩: to_dict()에서 ingredients 접근 시 N+1 방지)
    ingredients = relationship("Ingredient", back_populates="image", cascade="all, delete-orphan", lazy="selectin")
    user = relationship("User", back_populates="image_uploads")

    def __repr__(self):
        return f"<ImageUpload {self.id}>"

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "image_url": self.image_url,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "ingredients_count": len(self.ingredients) if self.ingredients else 0
        }
