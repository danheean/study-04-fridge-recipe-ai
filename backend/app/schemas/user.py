"""
사용자 관련 Pydantic 스키마
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, List
from datetime import datetime


class UserCreate(BaseModel):
    """사용자 생성 요청"""
    email: Optional[str] = Field(None, max_length=255)
    name: str = Field(..., min_length=1, max_length=100)
    preferences: Optional[Dict] = {}

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('이름을 입력해주세요')
        return v.strip()


class UserUpdate(BaseModel):
    """사용자 정보 수정 요청"""
    email: Optional[str] = Field(None, max_length=255)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    preferences: Optional[Dict] = None

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('이름을 입력해주세요')
        return v.strip() if v else v


class UserPreferences(BaseModel):
    """사용자 선호도 설정"""
    dietary_restrictions: Optional[List[str]] = Field(default=[], max_length=10)
    excluded_ingredients: Optional[List[str]] = Field(default=[], max_length=50)
    favorite_cuisines: Optional[List[str]] = Field(default=[], max_length=20)
    allergies: Optional[List[str]] = Field(default=[], max_length=20)

    @field_validator('dietary_restrictions', 'excluded_ingredients', 'favorite_cuisines', 'allergies')
    @classmethod
    def validate_list_items(cls, v):
        if not v:
            return []
        # 빈 문자열 제거 및 길이 제한
        cleaned = [item.strip() for item in v if item and item.strip()]
        # 각 항목 길이 제한 (100자)
        if any(len(item) > 100 for item in cleaned):
            raise ValueError('각 항목은 100자를 초과할 수 없습니다')
        return cleaned[:50]  # 최대 50개 항목


class UserResponse(BaseModel):
    """사용자 응답"""
    id: str
    email: Optional[str]
    name: str
    is_admin: bool = False
    preferences: Dict
    created_at: datetime

    class Config:
        from_attributes = True
