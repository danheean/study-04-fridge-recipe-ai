"""
인증 의존성 - JWT 토큰 검증 및 권한 확인
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.user import User
from app.utils.security import decode_access_token
from app.utils.logger import get_logger

logger = get_logger(__name__)

# HTTP Bearer 보안 스키마
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    현재 로그인한 사용자 조회

    Authorization 헤더에서 JWT 토큰을 추출하고 검증한 후,
    해당 사용자를 데이터베이스에서 조회하여 반환합니다.

    Args:
        credentials: HTTP Bearer 인증 정보
        db: 데이터베이스 세션

    Returns:
        User: 현재 사용자 객체

    Raises:
        HTTPException: 인증 실패 시 401 에러
    """
    # Bearer 토큰 추출
    token = credentials.credentials

    # JWT 토큰 검증
    payload = decode_access_token(token)
    if not payload:
        logger.warning("Invalid or expired JWT token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증이 만료되었거나 유효하지 않습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 사용자 ID 추출
    user_id: str = payload.get("sub")
    if not user_id:
        logger.warning("JWT token missing 'sub' claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰입니다",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 데이터베이스에서 사용자 조회
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        logger.warning(f"User not found: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"User authenticated: {user.email} (ID: {user.id})")
    return user


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    관리자 권한 확인

    현재 사용자가 관리자 권한을 가지고 있는지 확인합니다.

    Args:
        current_user: 현재 로그인한 사용자

    Returns:
        User: 관리자 사용자 객체

    Raises:
        HTTPException: 관리자 권한이 없는 경우 403 에러
    """
    if not current_user.is_admin:
        logger.warning(f"User {current_user.email} attempted admin access without permission")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다"
        )

    logger.info(f"Admin access granted: {current_user.email}")
    return current_user
