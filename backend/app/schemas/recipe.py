"""
레시피 관련 Pydantic 스키마
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime


class IngredientItem(BaseModel):
    """재료 항목"""
    name: str = Field(..., min_length=1, max_length=100)
    quantity: str = Field(..., min_length=1, max_length=50)
    available: bool = True


class RecipeCreate(BaseModel):
    """레시피 저장 요청"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    ingredients: List[Dict] = Field(..., min_length=1, max_length=50)
    instructions: List[str] = Field(..., min_length=1, max_length=30)
    cooking_time: int = Field(..., gt=0, le=1440)  # 1분~24시간
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    calories: Optional[int] = Field(None, ge=0, le=10000)

    @field_validator('title')
    @classmethod
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('레시피 제목을 입력해주세요')
        return v.strip()

    @field_validator('instructions')
    @classmethod
    def validate_instructions(cls, v):
        if not v:
            raise ValueError('조리 방법을 최소 1개 이상 입력해주세요')
        # 빈 문자열 제거
        cleaned = [step.strip() for step in v if step and step.strip()]
        if not cleaned:
            raise ValueError('유효한 조리 방법을 입력해주세요')
        # 각 단계 길이 제한 (500자)
        if any(len(step) > 500 for step in cleaned):
            raise ValueError('각 조리 단계는 500자를 초과할 수 없습니다')
        return cleaned

    @field_validator('ingredients')
    @classmethod
    def validate_ingredients(cls, v):
        if not v:
            raise ValueError('재료를 최소 1개 이상 입력해주세요')
        # 각 재료에 name과 quantity가 있는지 확인
        for ing in v:
            if not isinstance(ing, dict):
                raise ValueError('재료 형식이 올바르지 않습니다')
            if 'name' not in ing or not ing['name']:
                raise ValueError('재료 이름을 입력해주세요')
            if 'quantity' not in ing:
                raise ValueError('재료 수량을 입력해주세요')
        return v


class SavedRecipeResponse(BaseModel):
    """저장된 레시피 응답"""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    ingredients: List[Dict]
    instructions: List[str]
    cooking_time: int
    difficulty: str
    calories: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
