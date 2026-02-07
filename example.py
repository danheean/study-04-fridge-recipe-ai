"""
OpenRouter API 사용 예제
"""
import requests
from config import OPENROUTER_API_KEY, OPENROUTER_API_URL, MODELS


def chat_completion(prompt: str, model: str = None) -> str:
    """
    OpenRouter API를 사용하여 텍스트 생성

    Args:
        prompt: 입력 프롬프트
        model: 사용할 모델 (기본값: upstage/solar-pro-3:free)

    Returns:
        생성된 텍스트
    """
    if model is None:
        model = MODELS["text"][0]

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except requests.exceptions.RequestException as e:
        print(f"API 요청 중 오류 발생: {e}")
        if hasattr(e.response, 'text'):
            print(f"응답 내용: {e.response.text}")
        raise


if __name__ == "__main__":
    # 테스트 예제
    prompt = "안녕하세요! 간단하게 자기소개를 해주세요."
    print(f"프롬프트: {prompt}\n")

    try:
        response = chat_completion(prompt)
        print(f"응답:\n{response}")
    except Exception as e:
        print(f"오류 발생: {e}")
