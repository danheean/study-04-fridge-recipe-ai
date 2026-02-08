"""
사용자(User) 모델
"""
from sqlalchemy import Column, String, JSON, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class User(Base):
    """사용자 모델"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=True)
    name = Column(String)
    is_admin = Column(Boolean, default=False)  # 관리자 권한
    preferences = Column(JSON, default={})  # 선호도 설정
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    image_uploads = relationship("ImageUpload", back_populates="user")
    saved_recipes = relationship("SavedRecipe", back_populates="user")

    def __repr__(self):
        return f"<User {self.email or self.id}>"

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "is_admin": self.is_admin,
            "preferences": self.preferences,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
