"""
FastAPI 애플리케이션 진입점
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.db.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """애플리케이션 시작 및 종료 이벤트"""
    # 시작 시
    print("🚀 Starting FridgeChef API...")
    await init_db()
    print("✅ Database initialized")
    yield
    # 종료 시
    print("👋 Shutting down FridgeChef API...")


# FastAPI 앱 생성
app = FastAPI(
    title="FridgeChef API",
    description="냉장고 재료 인식 및 레시피 추천 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """헬스 체크"""
    return {
        "message": "FridgeChef API is running! 🍳",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    """상세 헬스 체크"""
    return {
        "status": "healthy",
        "database": "connected",
        "openrouter": "configured" if settings.OPENROUTER_API_KEY else "not configured"
    }


# API 라우터 등록
from app.api import images, recipes, users

app.include_router(images.router)
app.include_router(recipes.router)
app.include_router(users.router)
