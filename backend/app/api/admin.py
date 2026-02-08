"""
관리자 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.recipe import SavedRecipe
from app.models.image_upload import ImageUpload
from app.utils.logger import get_logger
from app.dependencies.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])
logger = get_logger(__name__)


@router.get("/users")
async def get_all_users(
    admin_user: User = Depends(require_admin),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """
    전체 사용자 목록 조회 (관리자 전용)

    Args:
        skip: 건너뛸 개수
        limit: 가져올 개수 (최대 100)
    """
    # JWT 토큰으로 관리자 권한 이미 확인됨

    # 파라미터 검증
    if skip < 0:
        raise HTTPException(status_code=400, detail="skip 값은 0 이상이어야 합니다.")
    if limit < 1:
        raise HTTPException(status_code=400, detail="limit 값은 1 이상이어야 합니다.")

    limit = min(limit, 100)

    # 전체 사용자 수
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar()

    # 사용자 목록 조회 (최신순)
    result = await db.execute(
        select(User)
        .order_by(desc(User.created_at))
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()

    return {
        "users": [user.to_dict() for user in users],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total
    }


@router.get("/stats")
async def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    전체 시스템 통계 조회 (관리자 전용)
    """
    # JWT 토큰으로 관리자 권한 이미 확인됨

    # 전체 사용자 수
    users_result = await db.execute(select(func.count()).select_from(User))
    total_users = users_result.scalar()

    # 전체 레시피 수
    recipes_result = await db.execute(select(func.count()).select_from(SavedRecipe))
    total_recipes = recipes_result.scalar()

    # 전체 이미지 업로드 수
    images_result = await db.execute(select(func.count()).select_from(ImageUpload))
    total_images = images_result.scalar()

    # 관리자 수
    admins_result = await db.execute(
        select(func.count()).select_from(User).filter(User.is_admin == True)
    )
    total_admins = admins_result.scalar()

    return {
        "total_users": total_users,
        "total_recipes": total_recipes,
        "total_images": total_images,
        "total_admins": total_admins
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    사용자 삭제 (관리자 전용)

    Args:
        user_id: 삭제할 사용자 ID
    """
    # JWT 토큰으로 관리자 권한 이미 확인됨

    # 자기 자신 삭제 방지
    if user_id == admin_user.id:
        raise HTTPException(status_code=400, detail="자기 자신은 삭제할 수 없습니다.")

    # 사용자 조회
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 사용자 삭제 (연관된 데이터는 cascade로 자동 삭제됨)
    await db.delete(user)
    await db.commit()

    logger.info(f"사용자 삭제 완료 - ID: {user_id}, 관리자: {admin_user.id}")

    return {"success": True, "message": "사용자가 삭제되었습니다."}


@router.put("/users/{user_id}/admin")
async def toggle_admin(
    user_id: str,
    is_admin: bool,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    사용자 관리자 권한 설정/해제 (관리자 전용)

    Args:
        user_id: 대상 사용자 ID
        is_admin: 관리자 권한 여부
    """
    # JWT 토큰으로 관리자 권한 이미 확인됨

    # 대상 사용자 조회
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 관리자 권한 업데이트
    user.is_admin = is_admin
    await db.commit()
    await db.refresh(user)

    action = "부여" if is_admin else "해제"
    logger.info(f"관리자 권한 {action} - 사용자: {user_id}, 관리자: {admin_user.id}")

    return {
        "success": True,
        "message": f"관리자 권한이 {action}되었습니다.",
        "user": user.to_dict()
    }
