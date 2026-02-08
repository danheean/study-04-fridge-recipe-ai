"""
애플리케이션 설정 관리
"""
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# .env 파일 로드 (프로젝트 루트에서)
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # OpenRouter API
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_API_URL: str = "https://openrouter.ai/api/v1/chat/completions"
    TEXT_MODEL: str = os.getenv("TEXT_MODEL", "upstage/solar-pro-3:free")
    IMAGE_MODEL: str = os.getenv("IMAGE_MODEL", "google/gemma-3-12b-it:free")

    # 데이터베이스
    DATABASE_URL: str = "sqlite+aiosqlite:///./fridgechef.db"

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",  # Vite 기본 포트
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # 이미지 설정
    MAX_IMAGE_SIZE: int = 20 * 1024 * 1024  # 20MB
    ALLOWED_IMAGE_TYPES: list = ["image/jpeg", "image/png", "image/jpg"]
    IMAGE_RESIZE_MAX: int = 1024  # 최대 너비/높이

    # Rate Limit
    MAX_REQUESTS_PER_DAY: int = 50  # 무료 티어 제한

    # 개발 모드
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "false").lower() == "true"

    # JWT 설정
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    class Config:
        env_file = ".env"
        case_sensitive = True


# 전역 설정 인스턴스
settings = Settings()

# 설정 검증
if not settings.OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY가 설정되지 않았습니다.")

if not settings.JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY가 설정되지 않았습니다. .env 파일에 32자 이상의 랜덤 문자열을 설정하세요.")
