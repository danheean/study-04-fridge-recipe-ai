"""
공통 응답 스키마
"""
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

# 제네릭 타입 변수
DataT = TypeVar('DataT')


class ApiResponse(BaseModel, Generic[DataT]):
    """표준 API 응답 형식"""
    success: bool
    data: Optional[DataT] = None
    message: Optional[str] = None
    error: Optional[dict] = None

    class Config:
        from_attributes = True


class ErrorDetail(BaseModel):
    """에러 상세 정보"""
    code: str
    message: str
    details: Optional[Any] = None


def success_response(data: Any = None, message: str = "Success") -> dict:
    """성공 응답 생성 헬퍼"""
    return {
        "success": True,
        "data": data,
        "message": message,
        "error": None
    }


def error_response(message: str, code: str = "ERROR", details: Any = None) -> dict:
    """에러 응답 생성 헬퍼"""
    return {
        "success": False,
        "data": None,
        "message": message,
        "error": {
            "code": code,
            "message": message,
            "details": details
        }
    }
