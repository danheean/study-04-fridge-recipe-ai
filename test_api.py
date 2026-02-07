"""
OpenRouter API 테스트 - 텍스트 및 이미지 인식
"""
import requests
import base64
from config import OPENROUTER_API_KEY, OPENROUTER_API_URL, TEXT_MODEL, IMAGE_MODEL


def test_text_recognition(prompt: str) -> str:
    """
    텍스트 생성 테스트 (Solar 모델 사용)

    Args:
        prompt: 입력 텍스트

    Returns:
        생성된 텍스트
    """
    print(f"\n{'='*60}")
    print(f"[텍스트 인식 테스트]")
    print(f"모델: {TEXT_MODEL}")
    print(f"{'='*60}")
    print(f"프롬프트: {prompt}\n")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": TEXT_MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        answer = result["choices"][0]["message"]["content"]

        print(f"응답:\n{answer}")
        print(f"\n{'='*60}\n")
        return answer

    except requests.exceptions.RequestException as e:
        print(f"❌ API 요청 중 오류 발생: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"응답 내용: {e.response.text}")
        raise


def test_image_recognition(image_url: str, question: str) -> str:
    """
    이미지 인식 테스트 (Gemma 모델 사용)

    Args:
        image_url: 이미지 URL
        question: 이미지에 대한 질문

    Returns:
        이미지 분석 결과
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

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        answer = result["choices"][0]["message"]["content"]

        print(f"응답:\n{answer}")
        print(f"\n{'='*60}\n")
        return answer

    except requests.exceptions.RequestException as e:
        print(f"❌ API 요청 중 오류 발생: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"응답 내용: {e.response.text}")
        raise


if __name__ == "__main__":
    # 1. 텍스트 인식 테스트
    print("\n🔤 텍스트 인식 API 테스트 시작...")
    text_prompt = "Python에서 리스트와 튜플의 차이점을 간단히 설명해주세요."

    try:
        test_text_recognition(text_prompt)
        print("✅ 텍스트 인식 테스트 성공!")
    except Exception as e:
        print(f"❌ 텍스트 인식 테스트 실패: {e}")

    # 2. 이미지 인식 테스트
    print("\n🖼️  이미지 인식 API 테스트 시작...")
    # 공개된 테스트 이미지 URL 사용
    test_image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/481px-Cat03.jpg"
    image_question = "이 이미지에 무엇이 보이나요? 자세히 설명해주세요."

    try:
        test_image_recognition(test_image_url, image_question)
        print("✅ 이미지 인식 테스트 성공!")
    except Exception as e:
        print(f"❌ 이미지 인식 테스트 실패: {e}")

    print("\n" + "="*60)
    print("모든 테스트 완료!")
    print("="*60)
