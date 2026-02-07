"""
이미지 인식 테스트 - 대체 모델 사용
"""
import requests
from config import OPENROUTER_API_KEY, OPENROUTER_API_URL


def test_image_with_model(image_url: str, question: str, model: str) -> str:
    """
    특정 모델로 이미지 인식 테스트
    """
    print(f"\n{'='*60}")
    print(f"[이미지 인식 테스트]")
    print(f"모델: {model}")
    print(f"{'='*60}")
    print(f"이미지 URL: {image_url}")
    print(f"질문: {question}\n")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": model,
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

        print(f"✅ 성공!\n")
        print(f"응답:\n{answer}")
        print(f"\n{'='*60}\n")
        return answer

    except requests.exceptions.RequestException as e:
        print(f"❌ 오류 발생: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"응답 내용: {e.response.text}\n")
        raise


if __name__ == "__main__":
    print("\n🖼️  여러 무료 멀티모달 모델로 이미지 인식 테스트...\n")

    # 테스트 이미지
    test_image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/481px-Cat03.jpg"
    question = "이 이미지에 무엇이 보이나요? 자세히 설명해주세요."

    # 시도할 무료 모델들
    free_vision_models = [
        "meta-llama/llama-3.2-11b-vision-instruct:free",
        "qwen/qwen2.5-vl-3b-instruct:free",
        "google/gemma-3-12b-it:free",
    ]

    success = False
    for model in free_vision_models:
        try:
            print(f"\n📍 모델 시도: {model}")
            test_image_with_model(test_image_url, question, model)
            success = True
            print(f"✅ {model} 모델로 성공!\n")
            break
        except Exception as e:
            print(f"⚠️ {model} 실패, 다음 모델 시도...\n")
            continue

    if success:
        print("\n" + "="*60)
        print("✅ 이미지 인식 테스트 성공!")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("❌ 모든 모델에서 실패")
        print("나중에 다시 시도해주세요.")
        print("="*60)
