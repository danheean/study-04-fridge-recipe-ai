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
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserPreferences
from app.schemas.recipe import RecipeCreate, SavedRecipeResponse

router = APIRouter(prefix="/api/users", tags=["users"])


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


@router.get("/{user_id}/recipes", response_model=List[SavedRecipeResponse])
async def get_saved_recipes(user_id: str, db: AsyncSession = Depends(get_db)):
    """저장된 레시피 목록 조회"""
    # 사용자 존재 확인
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    # 레시피 조회 (최신순)
    result = await db.execute(
        select(SavedRecipe)
        .filter(SavedRecipe.user_id == user_id)
        .order_by(SavedRecipe.created_at.desc())
    )
    recipes = result.scalars().all()

    return recipes


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
    from app.models.image_upload import ImageUpload
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
