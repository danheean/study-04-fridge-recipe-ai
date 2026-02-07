"""
이미지 처리 유틸리티
"""
import base64
import io
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.config import settings


async def validate_image(file: UploadFile) -> None:
    """
    이미지 파일 유효성 검사

    Args:
        file: 업로드된 파일

    Raises:
        HTTPException: 유효하지 않은 파일인 경우
    """
    # 파일 타입 검사
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 파일 형식입니다. {settings.ALLOWED_IMAGE_TYPES}만 가능합니다."
        )

    # 파일 크기 검사
    file.file.seek(0, 2)  # 파일 끝으로 이동
    file_size = file.file.tell()
    file.file.seek(0)  # 파일 시작으로 복귀

    if file_size > settings.MAX_IMAGE_SIZE:
        max_size_mb = settings.MAX_IMAGE_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"파일 크기가 너무 큽니다. 최대 {max_size_mb}MB까지 가능합니다."
        )


async def process_image(file: UploadFile) -> str:
    """
    이미지 처리 및 Base64 인코딩

    Args:
        file: 업로드된 이미지 파일

    Returns:
        Base64 인코딩된 이미지 문자열
    """
    # 유효성 검사
    await validate_image(file)

    # 이미지 읽기
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    # 이미지 최적화
    optimized_image = optimize_image(image)

    # Base64 인코딩
    buffered = io.BytesIO()
    optimized_image.save(buffered, format="JPEG", quality=85, optimize=True)
    img_bytes = buffered.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    return img_base64


def optimize_image(image: Image.Image, max_size: int = None) -> Image.Image:
    """
    이미지 리사이징 및 최적화

    Args:
        image: PIL Image 객체
        max_size: 최대 너비/높이 (기본값: settings.IMAGE_RESIZE_MAX)

    Returns:
        최적화된 Image 객체
    """
    if max_size is None:
        max_size = settings.IMAGE_RESIZE_MAX

    # RGB 변환 (PNG 투명도 제거)
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    # 리사이징 (비율 유지)
    image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    return image


def image_to_base64(image_path: str) -> str:
    """
    이미지 파일을 Base64로 변환

    Args:
        image_path: 이미지 파일 경로

    Returns:
        Base64 인코딩된 문자열
    """
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')
