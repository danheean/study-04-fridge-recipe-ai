"""
OpenRouter API 서비스
"""
import requests
import json
from typing import List, Dict, Optional
from app.config import settings


class OpenRouterService:
    """OpenRouter API 통합 서비스"""

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.api_url = settings.OPENROUTER_API_URL
        self.image_model = settings.IMAGE_MODEL
        self.text_model = settings.TEXT_MODEL

    def _create_headers(self) -> Dict[str, str]:
        """API 요청 헤더 생성"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def analyze_image(self, image_base64: str) -> Dict:
        """
        이미지에서 재료 추출

        Args:
            image_base64: Base64 인코딩된 이미지

        Returns:
            인식된 재료 목록
        """
        # 목 데이터 모드
        if settings.MOCK_MODE:
            print("[MOCK MODE] 목 데이터 반환")
            return {
                "ingredients": [
                    {
                        "name": "양배추",
                        "quantity": "1통",
                        "freshness": "fresh",
                        "confidence": 0.95
                    },
                    {
                        "name": "계란",
                        "quantity": "10개",
                        "freshness": "fresh",
                        "confidence": 0.92
                    },
                    {
                        "name": "오이",
                        "quantity": "3개",
                        "freshness": "moderate",
                        "confidence": 0.88
                    },
                    {
                        "name": "토마토",
                        "quantity": "5개",
                        "freshness": "fresh",
                        "confidence": 0.90
                    },
                    {
                        "name": "청양고추",
                        "quantity": "한 줌",
                        "freshness": "moderate",
                        "confidence": 0.85
                    },
                    {
                        "name": "파",
                        "quantity": "2대",
                        "freshness": "expiring",
                        "confidence": 0.78
                    }
                ]
            }

        headers = self._create_headers()

        prompt = """
        이 냉장고 사진을 분석하여 보이는 모든 재료를 추출해주세요.

        다음 JSON 형식으로만 응답해주세요 (다른 설명 없이):
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
        """

        data = {
            "model": self.image_model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ]
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=data, timeout=30)
            response.raise_for_status()

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # 디버깅: 응답 로깅
            print(f"[DEBUG] OpenRouter 응답: {content[:500]}")

            # JSON 파싱
            parsed = self._parse_json_response(content)
            print(f"[DEBUG] 파싱된 결과: {parsed}")

            return parsed

        except requests.exceptions.RequestException as e:
            raise Exception(f"OpenRouter API 오류: {str(e)}")

    async def generate_recipes(
        self,
        ingredients: List[str],
        preferences: Optional[Dict] = None
    ) -> List[Dict]:
        """
        재료 기반 레시피 생성

        Args:
            ingredients: 재료 목록
            preferences: 사용자 선호도

        Returns:
            레시피 목록
        """
        # 목 데이터 모드
        if settings.MOCK_MODE:
            print("[MOCK MODE] 목 레시피 반환")
            return {
                "recipes": [
                    {
                        "title": "오이무침",
                        "description": "신선한 오이로 만드는 상큼한 반찬",
                        "ingredients": [
                            {"name": "오이", "quantity": "2개", "available": True},
                            {"name": "고춧가루", "quantity": "1큰술", "available": False},
                            {"name": "식초", "quantity": "2큰술", "available": False},
                            {"name": "설탕", "quantity": "1큰술", "available": False}
                        ],
                        "instructions": [
                            "오이를 깨끗이 씻어 얇게 썰어주세요",
                            "소금을 뿌려 10분간 절여주세요",
                            "물기를 짜고 양념(고춧가루, 식초, 설탕)을 넣어 버무립니다",
                            "마지막으로 참기름을 넣어 마무리합니다"
                        ],
                        "cooking_time": 15,
                        "difficulty": "easy",
                        "calories": 45
                    },
                    {
                        "title": "계란볶음밥",
                        "description": "냉장고 재료로 간단하게 만드는 볶음밥",
                        "ingredients": [
                            {"name": "계란", "quantity": "3개", "available": True},
                            {"name": "파", "quantity": "1대", "available": True},
                            {"name": "밥", "quantity": "2공기", "available": False},
                            {"name": "간장", "quantity": "2큰술", "available": False}
                        ],
                        "instructions": [
                            "팬에 기름을 두르고 계란을 스크램블해주세요",
                            "파를 송송 썰어 넣고 볶습니다",
                            "밥을 넣고 계란과 골고루 섞어주세요",
                            "간장으로 간을 맞추고 완성합니다"
                        ],
                        "cooking_time": 10,
                        "difficulty": "easy",
                        "calories": 420
                    },
                    {
                        "title": "토마토 계란볶음",
                        "description": "중국식 가정요리의 대표 메뉴",
                        "ingredients": [
                            {"name": "토마토", "quantity": "3개", "available": True},
                            {"name": "계란", "quantity": "4개", "available": True},
                            {"name": "설탕", "quantity": "1큰술", "available": False},
                            {"name": "소금", "quantity": "약간", "available": False}
                        ],
                        "instructions": [
                            "토마토를 큼직하게 썰어주세요",
                            "계란을 풀어 스크램블을 만들고 따로 덜어둡니다",
                            "같은 팬에 토마토를 넣고 볶다가 설탕을 넣습니다",
                            "토마토가 무르면 계란을 넣고 가볍게 섞어 완성합니다"
                        ],
                        "cooking_time": 20,
                        "difficulty": "easy",
                        "calories": 280
                    }
                ]
            }

        headers = self._create_headers()

        ingredients_str = ", ".join(ingredients)

        prompt = f"""
        다음 재료를 사용하여 만들 수 있는 레시피 3개를 추천해주세요:
        재료: {ingredients_str}

        다음 JSON 형식으로만 응답해주세요 (다른 설명 없이):
        {{
          "recipes": [
            {{
              "title": "요리 이름",
              "description": "한 줄 설명",
              "ingredients": [
                {{"name": "재료명", "quantity": "수량", "available": true}}
              ],
              "instructions": ["단계1", "단계2", "단계3"],
              "cooking_time": 30,
              "difficulty": "easy",
              "calories": 350
            }}
          ]
        }}

        조건:
        - 주어진 재료를 최대한 활용
        - 부족한 재료는 available: false로 표시
        - 난이도는 easy/medium/hard 중 선택
        - 조리시간은 분 단위
        - 한국 요리 위주로 추천
        """

        if preferences:
            if preferences.get('dietary_restrictions'):
                prompt += f"\n식단 제한: {', '.join(preferences['dietary_restrictions'])}"
            if preferences.get('excluded_ingredients'):
                prompt += f"\n제외할 재료: {', '.join(preferences['excluded_ingredients'])}"

        data = {
            "model": self.text_model,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=data, timeout=60)
            response.raise_for_status()

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            # JSON 파싱
            return self._parse_json_response(content)

        except requests.exceptions.RequestException as e:
            raise Exception(f"OpenRouter API 오류: {str(e)}")

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
                content = content.split("```")[1].split("```")[0]

            # JSON 파싱
            return json.loads(content.strip())

        except json.JSONDecodeError as e:
            # 파싱 실패 시 원본 텍스트 반환
            return {"error": "JSON 파싱 실패", "raw_content": content}
