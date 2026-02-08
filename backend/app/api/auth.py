"""
인증 API 엔드포인트 - 회원가입, 로그인, 비밀번호 재설정
"""
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, PasswordResetRequest, UserInfo
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.logger import get_logger

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = get_logger(__name__)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    회원가입

    새로운 사용자를 생성하고 JWT 토큰을 발급합니다.

    Args:
        request: 회원가입 요청 (email, password, name)
        db: 데이터베이스 세션

    Returns:
        TokenResponse: JWT 토큰 및 사용자 정보

    Raises:
        HTTPException: 이메일이 이미 등록된 경우 400 에러
    """
    # 이메일 중복 확인
    result = await db.execute(select(User).where(User.email == request.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        logger.warning(f"Registration attempt with existing email: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다"
        )

    # 비밀번호 해싱
    password_hash = hash_password(request.password)

    # 사용자 생성
    new_user = User(
        email=request.email,
        name=request.name,
        password_hash=password_hash,
        is_admin=False
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    logger.info(f"New user registered: {new_user.email} (ID: {new_user.id})")

    # JWT 토큰 생성
    access_token = create_access_token(
        data={
            "sub": new_user.id,
            "email": new_user.email,
            "is_admin": new_user.is_admin
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserInfo(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            is_admin=new_user.is_admin,
            created_at=new_user.created_at
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    로그인

    이메일과 비밀번호를 확인하고 JWT 토큰을 발급합니다.

    Args:
        request: 로그인 요청 (email, password)
        db: 데이터베이스 세션

    Returns:
        TokenResponse: JWT 토큰 및 사용자 정보

    Raises:
        HTTPException: 인증 실패 시 401 에러
    """
    # 이메일로 사용자 조회
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        logger.warning(f"Login attempt with non-existent email: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다"
        )

    # 비밀번호가 설정되지 않은 기존 사용자
    if not user.password_hash:
        logger.info(f"Login attempt for user without password: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비밀번호가 설정되지 않은 계정입니다. 비밀번호 재설정을 진행해주세요."
        )

    # 비밀번호 검증
    if not verify_password(request.password, user.password_hash):
        logger.warning(f"Failed login attempt for user: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다"
        )

    logger.info(f"User logged in: {user.email} (ID: {user.id})")

    # JWT 토큰 생성
    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "is_admin": user.is_admin
        }
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserInfo(
            id=user.id,
            email=user.email,
            name=user.name,
            is_admin=user.is_admin,
            created_at=user.created_at
        )
    )


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    비밀번호 재설정 (기존 사용자용)

    password_hash가 NULL인 기존 사용자를 위한 비밀번호 설정 엔드포인트입니다.

    Args:
        request: 비밀번호 재설정 요청 (email, new_password)
        db: 데이터베이스 세션

    Returns:
        dict: 성공 메시지

    Raises:
        HTTPException: 사용자를 찾을 수 없거나 이미 비밀번호가 설정된 경우 400 에러
    """
    # 이메일로 사용자 조회
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user:
        logger.warning(f"Password reset attempt for non-existent user: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 이메일의 사용자를 찾을 수 없습니다"
        )

    # 이미 비밀번호가 설정된 경우
    if user.password_hash:
        logger.warning(f"Password reset attempt for user with existing password: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 비밀번호가 설정된 계정입니다. 로그인 후 설정에서 비밀번호를 변경하세요."
        )

    # 새 비밀번호 해싱 및 저장
    user.password_hash = hash_password(request.new_password)
    await db.commit()

    logger.info(f"Password set for existing user: {user.email} (ID: {user.id})")

    return {
        "message": "비밀번호가 성공적으로 설정되었습니다. 이제 로그인할 수 있습니다."
    }
