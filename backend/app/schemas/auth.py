"""
인증 관련 스키마 (Pydantic 모델)
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


class RegisterRequest(BaseModel):
    """회원가입 요청"""
    email: EmailStr = Field(..., description="이메일")
    password: str = Field(..., min_length=8, description="비밀번호 (8자 이상)")
    name: str = Field(..., min_length=1, max_length=50, description="사용자 이름")

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """비밀번호 검증"""
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다')
        return v


class LoginRequest(BaseModel):
    """로그인 요청"""
    email: EmailStr = Field(..., description="이메일")
    password: str = Field(..., description="비밀번호")


class PasswordResetRequest(BaseModel):
    """비밀번호 재설정 요청 (기존 사용자용)"""
    email: EmailStr = Field(..., description="이메일")
    new_password: str = Field(..., min_length=8, description="새 비밀번호 (8자 이상)")

    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """비밀번호 검증"""
        if len(v) < 8:
            raise ValueError('비밀번호는 최소 8자 이상이어야 합니다')
        return v


class UserInfo(BaseModel):
    """사용자 정보 (토큰 응답용)"""
    id: str
    email: Optional[str] = None
    name: str
    is_admin: bool = False
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    """토큰 응답"""
    access_token: str = Field(..., description="JWT Access Token")
    token_type: str = Field(default="bearer", description="토큰 타입")
    user: UserInfo = Field(..., description="사용자 정보")
