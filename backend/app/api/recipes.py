"""
레시피 관련 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.openrouter_service import OpenRouterService

router = APIRouter(prefix="/api/recipes", tags=["recipes"])
openrouter_service = OpenRouterService()


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
        result = await openrouter_service.generate_recipes(
            ingredients=request.ingredients,
            preferences=request.preferences
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
