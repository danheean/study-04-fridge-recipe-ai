"""
데이터베이스 설정 및 세션 관리
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

# 비동기 엔진 생성
# echo=False: 프로덕션 성능 향상 (SQL 로깅 비활성화)
# 디버깅 필요시 echo=True로 변경
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

# 세션 팩토리
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base 클래스
Base = declarative_base()


async def get_db():
    """데이터베이스 세션 의존성"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """데이터베이스 초기화"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
