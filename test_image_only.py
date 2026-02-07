"""
이미지 인식만 테스트
"""
import requests
import time
from config import OPENROUTER_API_KEY, OPENROUTER_API_URL, IMAGE_MODEL


def test_image_recognition(image_url: str, question: str, retry_count: int = 3) -> str:
    """
    이미지 인식 테스트 (재시도 로직 포함)
    """
    print(f"\n{'='*60}")
    print(f"[이미지 인식 테스트]")
    print(f"모델: {IMAGE_MODEL}")
    print(f"{'='*60}")
    print(f"이미지 URL: {image_url}")
    print(f"질문: {question}\n")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": IMAGE_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": question
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": image_url
                        }
                    }
                ]
            }
        ]
    }

    for attempt in range(retry_count):
        try:
            print(f"시도 {attempt + 1}/{retry_count}...")
            response = requests.post(OPENROUTER_API_URL, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            answer = result["choices"][0]["message"]["content"]

            print(f"\n✅ 성공!\n")
            print(f"응답:\n{answer}")
            print(f"\n{'='*60}\n")
            return answer

        except requests.exceptions.RequestException as e:
            if hasattr(e, 'response') and e.response is not None and e.response.status_code == 429:
                if attempt < retry_count - 1:
                    wait_time = (attempt + 1) * 5
                    print(f"⚠️ Rate limit 발생. {wait_time}초 후 재시도...")
                    time.sleep(wait_time)
                else:
                    print(f"❌ API 요청 중 오류 발생: {e}")
                    print(f"응답 내용: {e.response.text}")
                    raise
            else:
                print(f"❌ API 요청 중 오류 발생: {e}")
                if hasattr(e, 'response') and e.response is not None:
                    print(f"응답 내용: {e.response.text}")
                raise


if __name__ == "__main__":
    print("\n🖼️  이미지 인식 API 테스트 시작...\n")

    # 테스트 이미지 URL
    test_image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/481px-Cat03.jpg"
    image_question = "이 이미지에 무엇이 보이나요? 자세히 설명해주세요."

    try:
        test_image_recognition(test_image_url, image_question)
        print("✅ 이미지 인식 테스트 성공!")
    except Exception as e:
        print(f"\n❌ 이미지 인식 테스트 실패")
        print(f"원인: {type(e).__name__}: {e}")
        print("\n💡 해결 방법:")
        print("  1. 몇 분 후 다시 시도해보세요")
        print("  2. OpenRouter 대시보드에서 사용량을 확인해보세요")
        print("  3. 다른 무료 모델을 시도해보세요")
