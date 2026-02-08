"""
사용자 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.recipe import SavedRecipe
from app.models.image_upload import ImageUpload
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserPreferences
from app.schemas.recipe import RecipeCreate, SavedRecipeResponse
from app.utils.logger import get_logger

router = APIRouter(prefix="/api/users", tags=["users"])
logger = get_logger(__name__)


@router.post("/", response_model=UserResponse)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """새 사용자 생성"""
    # 이메일 중복 확인
    if user_data.email:
        result = await db.execute(select(User).filter(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")

    # 사용자 생성
    user = User(
        email=user_data.email,
        name=user_data.name,
        preferences=user_data.preferences or {}
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.get("/by-email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str, db: AsyncSession = Depends(get_db)):
    """이메일로 사용자 정보 조회"""
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """사용자 정보 조회"""
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """사용자 정보 수정"""
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 업데이트
    if user_data.email is not None:
        # 이메일 중복 확인
        result = await db.execute(
            select(User).filter(User.email == user_data.email, User.id != user_id)
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")
        user.email = user_data.email

    if user_data.name is not None:
        user.name = user_data.name

    if user_data.preferences is not None:
        user.preferences = user_data.preferences

    await db.commit()
    await db.refresh(user)

    return user


@router.put("/{user_id}/preferences")
async def update_preferences(
    user_id: str,
    preferences: UserPreferences,
    db: AsyncSession = Depends(get_db)
):
    """사용자 선호도 설정 업데이트"""
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    user.preferences = preferences.dict()
    await db.commit()

    return {"success": True, "preferences": user.preferences}


# === 레시피 저장 관련 엔드포인트 ===

@router.post("/{user_id}/recipes", response_model=SavedRecipeResponse)
async def save_recipe(
    user_id: str,
    recipe_data: RecipeCreate,
    db: AsyncSession = Depends(get_db)
):
    """레시피 저장"""
    # 사용자 존재 확인
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 레시피 저장
    saved_recipe = SavedRecipe(
        user_id=user_id,
        title=recipe_data.title,
        description=recipe_data.description,
        ingredients=recipe_data.ingredients,
        instructions=recipe_data.instructions,
        cooking_time=recipe_data.cooking_time,
        difficulty=recipe_data.difficulty,
        calories=recipe_data.calories
    )

    db.add(saved_recipe)
    await db.commit()
    await db.refresh(saved_recipe)

    return saved_recipe


@router.get("/{user_id}/recipes")
async def get_saved_recipes(
    user_id: str,
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    저장된 레시피 목록 조회 (페이지네이션 지원)

    Args:
        user_id: 사용자 ID
        skip: 건너뛸 개수 (기본값: 0)
        limit: 가져올 개수 (기본값: 10, 최대: 100)

    Returns:
        recipes: 레시피 목록
        total: 전체 레시피 개수
        skip: 건너뛴 개수
        limit: 가져온 개수
    """
    logger.info(f"레시피 목록 조회 - 사용자: {user_id}, skip: {skip}, limit: {limit}")

    # 파라미터 검증
    if skip < 0:
        raise HTTPException(status_code=400, detail="skip 값은 0 이상이어야 합니다.")
    if limit < 1:
        raise HTTPException(status_code=400, detail="limit 값은 1 이상이어야 합니다.")

    # 사용자 존재 확인
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        logger.warning(f"사용자를 찾을 수 없음 - ID: {user_id}")
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # limit 최대값 제한
    limit = min(limit, 100)

    # 전체 개수 조회
    count_result = await db.execute(
        select(func.count())
        .select_from(SavedRecipe)
        .filter(SavedRecipe.user_id == user_id)
    )
    total = count_result.scalar()

    # 레시피 조회 (최신순, 페이지네이션)
    result = await db.execute(
        select(SavedRecipe)
        .filter(SavedRecipe.user_id == user_id)
        .order_by(SavedRecipe.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    recipes = result.scalars().all()

    logger.info(f"레시피 목록 조회 완료 - 총 {total}개 중 {len(recipes)}개 반환")

    return {
        "recipes": [recipe.to_dict() for recipe in recipes],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total
    }


@router.get("/{user_id}/recipes/{recipe_id}", response_model=SavedRecipeResponse)
async def get_saved_recipe(
    user_id: str,
    recipe_id: str,
    db: AsyncSession = Depends(get_db)
):
    """저장된 레시피 상세 조회"""
    result = await db.execute(
        select(SavedRecipe).filter(
            SavedRecipe.id == recipe_id,
            SavedRecipe.user_id == user_id
        )
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="레시피를 찾을 수 없습니다.")

    return recipe


@router.delete("/{user_id}/recipes/{recipe_id}")
async def delete_saved_recipe(
    user_id: str,
    recipe_id: str,
    db: AsyncSession = Depends(get_db)
):
    """저장된 레시피 삭제"""
    result = await db.execute(
        select(SavedRecipe).filter(
            SavedRecipe.id == recipe_id,
            SavedRecipe.user_id == user_id
        )
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=404, detail="레시피를 찾을 수 없습니다.")

    await db.delete(recipe)
    await db.commit()

    return {"success": True, "message": "레시피가 삭제되었습니다."}


@router.get("/{user_id}/stats")
async def get_user_stats(user_id: str, db: AsyncSession = Depends(get_db)):
    """사용자 통계 조회"""
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 저장된 레시피 수
    result = await db.execute(
        select(func.count()).select_from(SavedRecipe).filter(SavedRecipe.user_id == user_id)
    )
    saved_recipes_count = result.scalar()

    # 업로드한 이미지 수
    result = await db.execute(
        select(func.count()).select_from(ImageUpload).filter(ImageUpload.user_id == user_id)
    )
    uploaded_images_count = result.scalar()

    return {
        "user_id": user_id,
        "total_saved_recipes": saved_recipes_count,
        "total_uploads": uploaded_images_count,
        "member_since": user.created_at.isoformat() if user.created_at else None
    }
