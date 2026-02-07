"""
레시피 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.openrouter_service import OpenRouterService
from app.utils.logger import get_logger

router = APIRouter(prefix="/api/recipes", tags=["recipes"])
openrouter_service = OpenRouterService()
logger = get_logger(__name__)


class RecipeRequest(BaseModel):
    """레시피 생성 요청"""
    ingredients: List[str]
    preferences: Optional[Dict] = None


@router.post("/generate")
async def generate_recipes(request: RecipeRequest):
    """
    재료 기반 레시피 생성

    Args:
        request: 재료 목록 및 선호도

    Returns:
        생성된 레시피 목록
    """
    try:
        logger.info(
            f"레시피 생성 요청 - 재료: {len(request.ingredients)}개, "
            f"선호도: {bool(request.preferences)}"
        )

        result = await openrouter_service.generate_recipes(
            ingredients=request.ingredients,
            preferences=request.preferences
        )

        if "error" in result:
            logger.error(f"레시피 생성 실패: {result['error']}")
            raise HTTPException(status_code=500, detail=result["error"])

        recipe_count = len(result.get("recipes", []))
        logger.info(f"레시피 생성 완료 - {recipe_count}개 생성")

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"레시피 생성 중 오류: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
