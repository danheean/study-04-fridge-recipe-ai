"""
이미지 업로드 및 분석 API
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.database import get_db
from app.services.ollama_service import OllamaService
from app.utils.image_utils import process_image
from app.utils.logger import get_logger
from app.models import ImageUpload, Ingredient

router = APIRouter(prefix="/api/images", tags=["images"])
ollama_service = OllamaService()
logger = get_logger(__name__)


@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    custom_prompt: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    이미지 업로드 및 재료 인식

    Args:
        file: 업로드된 이미지 파일
        user_id: 사용자 ID (선택사항)
        db: 데이터베이스 세션

    Returns:
        인식된 재료 목록
    """
    try:
        logger.info(f"이미지 분석 요청 - 파일명: {file.filename}, 사용자: {user_id}")

        # 1. 이미지 처리 및 Base64 인코딩
        image_base64 = await process_image(file)
        logger.debug(f"이미지 처리 완료 - Base64 길이: {len(image_base64)}")

        # 2. Ollama API로 이미지 분석
        result = await ollama_service.analyze_image(image_base64, custom_prompt=custom_prompt)

        # 3. 데이터베이스에 저장
        image_upload = ImageUpload(user_id=user_id)
        db.add(image_upload)
        await db.flush()  # ID 생성
        logger.debug(f"이미지 업로드 레코드 생성 - ID: {image_upload.id}")

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
        logger.info(f"이미지 분석 완료 - 재료 {len(saved_ingredients)}개 인식")

        # 5. 응답 생성
        return {
            "success": True,
            "image_id": image_upload.id,
            "ingredients": [ing.to_dict() for ing in saved_ingredients],
            "total_count": len(saved_ingredients),
            "model": result.get("model", "gemma3:12b")  # 사용된 모델 정보
        }

    except ValueError as e:
        # 이미지 검증 실패
        logger.warning(f"이미지 검증 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        # 기타 오류
        logger.error(f"이미지 분석 중 오류: {str(e)}", exc_info=True)
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
