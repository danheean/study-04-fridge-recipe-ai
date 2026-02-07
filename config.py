"""
환경변수 설정 관리
"""
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# API 키 가져오기
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# API 키 유효성 검사
if not OPENROUTER_API_KEY:
    raise ValueError(
        "OPENROUTER_API_KEY가 설정되지 않았습니다. "
        ".env 파일을 확인하세요."
    )

# 모델 설정
TEXT_MODEL = os.getenv("TEXT_MODEL", "upstage/solar-pro-3:free")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "google/gemma-3-27b-it:free")

# OpenRouter API 엔드포인트
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
