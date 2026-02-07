"""
이미지 업로드 및 분석 API
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.openrouter_service import OpenRouterService
from app.utils.image_utils import process_image
from app.models import ImageUpload, Ingredient

router = APIRouter(prefix="/api/images", tags=["images"])
openrouter_service = OpenRouterService()


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    이미지 업로드 및 재료 인식

    Args:
        file: 업로드된 이미지 파일
        db: 데이터베이스 세션

    Returns:
        인식된 재료 목록
    """
    try:
        # 1. 이미지 처리 및 Base64 인코딩
        image_base64 = await process_image(file)

        # 2. OpenRouter API로 이미지 분석
        result = await openrouter_service.analyze_image(image_base64)

        # 3. 데이터베이스에 저장
        image_upload = ImageUpload()
        db.add(image_upload)
        await db.flush()  # ID 생성

        # 4. 재료 저장
        ingredients_data = result.get("ingredients", [])
        saved_ingredients = []

        for ing_data in ingredients_data:
            ingredient = Ingredient(
                name=ing_data.get("name"),
                quantity=ing_data.get("quantity"),
                freshness=ing_data.get("freshness", "moderate"),
                confidence=ing_data.get("confidence", 0.8),
                image_id=image_upload.id
            )
            db.add(ingredient)
            saved_ingredients.append(ingredient)

        await db.commit()

        # 5. 응답 생성
        return {
            "success": True,
            "image_id": image_upload.id,
            "ingredients": [ing.to_dict() for ing in saved_ingredients],
            "total_count": len(saved_ingredients)
        }

    except ValueError as e:
        # 이미지 검증 실패
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        # 기타 오류
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"이미지 분석 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    return {
        "message": "Images API is working!",
        "endpoint": "/api/images/analyze"
    }
