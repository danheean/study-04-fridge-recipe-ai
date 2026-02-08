"""
Ollama API 서비스
"""
import httpx
import json
import logging
from typing import List, Dict, Optional
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)
from app.utils.logger import get_logger

# 로거 설정
logger = get_logger(__name__)


class OllamaService:
    """Ollama API 통합 서비스"""

    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.image_model = "gemma3:12b"  # 이미지 분석용 멀티모달 모델

        # httpx 클라이언트 설정
        self.timeout = httpx.Timeout(120.0, connect=10.0)
        self.limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.NetworkError)),
        before_sleep=before_sleep_log(logger, logging.WARNING)
    )
    async def _make_chat_request(
        self,
        model: str,
        messages: List[Dict],
        timeout: Optional[float] = None
    ) -> Dict:
        """
        Ollama Chat API에 요청 보내기

        Args:
            model: 모델 이름
            messages: 메시지 목록
            timeout: 타임아웃 (초)

        Returns:
            API 응답
        """
        request_timeout = timeout or 120.0
        url = f"{self.base_url}/api/chat"

        data = {
            "model": model,
            "messages": messages,
            "stream": False,
            "format": "json"
        }

        async with httpx.AsyncClient(
            timeout=httpx.Timeout(request_timeout, connect=10.0),
            limits=self.limits
        ) as client:
            try:
                logger.info(f"Ollama 요청 시작 - 모델: {model}")
                response = await client.post(url, json=data)
                response.raise_for_status()
                result = response.json()
                logger.info("Ollama 요청 완료")
                return result

            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP 오류: {e.response.status_code} - {e.response.text}")
                raise Exception(f"Ollama API HTTP 오류: {e.response.status_code}")
            except httpx.TimeoutException:
                logger.error("Ollama API 타임아웃")
                raise
            except httpx.NetworkError as e:
                logger.error(f"네트워크 오류 (Ollama가 실행 중인지 확인하세요): {str(e)}")
                raise Exception("Ollama 서버에 연결할 수 없습니다. Ollama가 실행 중인지 확인하세요.")
            except Exception as e:
                logger.error(f"API 요청 중 예상치 못한 오류: {str(e)}")
                raise Exception(f"Ollama API 오류: {str(e)}")

    async def analyze_image(self, image_base64: str, custom_prompt: str = None) -> Dict:
        """
        이미지에서 재료 추출

        Args:
            image_base64: Base64 인코딩된 이미지
            custom_prompt: 커스텀 프롬프트 (optional)

        Returns:
            인식된 재료 목록
        """
        logger.info(f"이미지 분석 시작 - 모델: {self.image_model}")

        base_prompt = """이 냉장고 사진을 분석하여 보이는 모든 재료를 추출해주세요.

다음 JSON 형식으로만 응답해주세요:
{
  "ingredients": [
    {
      "name": "재료명",
      "quantity": "수량 (예: 2개, 500g, 1팩)",
      "freshness": "신선도 (fresh/moderate/expiring 중 하나)",
      "confidence": 0.95
    }
  ]
}

주의사항:
- 명확히 보이는 재료만 포함
- 한글 재료명 사용
- 수량은 대략적으로 추정
- freshness는 재료의 색깔과 상태를 보고 판단 (신선: fresh, 보통: moderate, 시들: expiring)
- confidence는 0.0~1.0 사이의 값으로 얼마나 확신하는지 표시
"""

        # 커스텀 프롬프트가 있으면 추가
        if custom_prompt:
            prompt = f"{base_prompt}\n\n추가 요청사항:\n{custom_prompt}"
            logger.info(f"커스텀 프롬프트 사용: {custom_prompt}")
        else:
            prompt = base_prompt

        messages = [
            {
                "role": "user",
                "content": prompt,
                "images": [image_base64]
            }
        ]

        try:
            result = await self._make_chat_request(
                model=self.image_model,
                messages=messages,
                timeout=120.0
            )

            content = result.get("message", {}).get("content", "{}")
            logger.info(f"Ollama 이미지 분석 응답: {content[:500]}")

            # JSON 파싱
            parsed = self._parse_json_response(content)

            # ingredients가 없으면 빈 배열 반환
            if "ingredients" not in parsed or not isinstance(parsed["ingredients"], list):
                logger.warning("재료 목록이 없거나 형식이 잘못되었습니다.")
                parsed = {"ingredients": []}

            # 모델 정보 추가
            parsed["model"] = self.image_model

            logger.info(f"파싱된 재료 개수: {len(parsed.get('ingredients', []))}")
            return parsed

        except Exception as e:
            logger.error(f"이미지 분석 실패: {str(e)}")
            raise


    def _parse_json_response(self, content: str) -> Dict:
        """
        LLM 응답에서 JSON 추출 및 파싱

        Args:
            content: LLM 응답 텍스트

        Returns:
            파싱된 JSON 객체
        """
        try:
            # 코드 블록 제거
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                # 첫 번째 ```와 마지막 ``` 사이의 내용 추출
                parts = content.split("```")
                if len(parts) >= 3:
                    content = parts[1]

            # JSON 파싱
            parsed = json.loads(content.strip())
            return parsed

        except json.JSONDecodeError as e:
            logger.error(f"JSON 파싱 실패: {str(e)}")
            logger.error(f"원본 내용: {content}")
            # 파싱 실패 시 빈 결과 반환
            return {"error": "JSON 파싱 실패", "raw_content": content[:200]}
