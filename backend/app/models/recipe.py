"""
레시피(Recipe) 및 저장된 레시피(SavedRecipe) 모델
"""
from sqlalchemy import Column, String, JSON, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class SavedRecipe(Base):
    """저장된 레시피 모델"""
    __tablename__ = "saved_recipes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # 레시피 데이터 (JSON 저장)
    title = Column(String, nullable=False)
    description = Column(String)
    ingredients = Column(JSON)  # 재료 목록
    instructions = Column(JSON)  # 조리 단계
    cooking_time = Column(Integer)  # 분 단위
    difficulty = Column(String)  # easy, medium, hard
    calories = Column(Integer)

    # 메타데이터
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    user = relationship("User", back_populates="saved_recipes")

    def __repr__(self):
        return f"<SavedRecipe {self.title}>"

    def to_dict(self):
        """딕셔너리로 변환"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "ingredients": self.ingredients,
            "instructions": self.instructions,
            "cooking_time": self.cooking_time,
            "difficulty": self.difficulty,
            "calories": self.calories,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
