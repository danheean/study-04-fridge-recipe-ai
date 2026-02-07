# Study-04

VibeCoding 홍공 스터디 프로젝트 - OpenRouter API를 사용한 LLM 실습

## 환경 설정

### 1. 가상환경 생성

```bash
uv venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows
```

### 2. 의존성 설치

```bash
uv pip install -r requirements.txt
```

### 3. 환경변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하세요:
```bash
cp .env.example .env
```

`.env` 파일에 실제 API 키를 입력하세요:
```
OPENROUTER_API_KEY=your_actual_api_key_here
```

## 사용 방법

### 기본 예제 실행

```bash
python example.py
```

### API 테스트 실행

```bash
# 텍스트 + 이미지 인식 통합 테스트
python test_api.py

# 이미지 인식만 테스트 (재시도 로직 포함)
python test_image_only.py

# 여러 모델 자동 시도
python test_image_alternative.py
```

### 코드에서 사용하기

```python
from config import OPENROUTER_API_KEY, TEXT_MODEL, IMAGE_MODEL
import requests

# API 호출 예제는 example.py 참조
```

## 사용 가능한 모델

### 텍스트 생성 모델
- `upstage/solar-pro-3:free` (기본값)
- `z-ai/glm-4.5-air:free`

### 멀티모달 모델 (이미지 분석)
- `google/gemma-3-12b-it:free` (권장 - 안정적)
- `google/gemma-3-27b-it:free` (대안 - 일시적 rate limit 가능)

## OpenRouter Rate Limit 정책

### 🆓 무료 티어 (Free Tier)

#### 기본 제한 (크레딧 구매 없음)
- **분당 요청 수**: 20 requests/minute
- **일일 요청 수**: 50 requests/day
- **적용 모델**: `:free`로 끝나는 모든 모델

#### 향상된 제한 (최소 $10 크레딧 구매 시)
- **분당 요청 수**: 20 requests/minute
- **일일 요청 수**: 1,000 requests/day (20배 증가)

### ⚠️ 추가 제한 사항

1. **Provider Rate Limit**: 무료 모델은 제공자(Google, Meta 등)의 upstream rate limit에도 영향을 받음
2. **전역 관리**: 여러 계정/API 키를 만들어도 rate limit은 전역적으로 관리됨
3. **실패한 요청**: 에러가 발생해도 일일 할당량에 포함됨
4. **잔액 제한**: 계정 잔액이 마이너스(-)면 무료 모델도 사용 불가

### 📊 사용량 확인

```bash
curl https://openrouter.ai/api/v1/key \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### 💡 Rate Limit 대처 방법

1. **다른 무료 모델 시도**: 각 모델마다 개별 제한이 있어 로드 분산 가능
2. **크레딧 구매**: $10 구매 시 일일 50회 → 1,000회로 증가
3. **시간 대기**: 일일 할당량은 자정(UTC)에 리셋

## 프로젝트 구조

```
.
├── .env                        # 환경변수 (git에 커밋 X)
├── .env.example                # 환경변수 템플릿
├── requirements.txt            # Python 의존성
├── config.py                   # 환경변수 로드 및 설정
├── example.py                  # OpenRouter API 사용 예제
├── test_api.py                 # 텍스트/이미지 인식 통합 테스트
├── test_image_only.py          # 이미지 인식 전용 테스트 (재시도 로직)
└── test_image_alternative.py   # 여러 모델 자동 시도 테스트
```

## 보안 주의사항

⚠️ `.env` 파일은 절대 git에 커밋하지 마세요. 이 파일에는 민감한 API 키가 포함되어 있습니다.
