# 프롬프트 내역

이 파일은 프로젝트 설정 과정에서 사용된 프롬프트와 작업 내역을 기록합니다.

## 1. 프로젝트 초기화

**프롬프트**: `/init`

**작업 내용**:
- CLAUDE.md 파일 생성
- 프로젝트 개요 및 환경 설정 문서화

**결과**:
- 최소한의 CLAUDE.md 생성 (환경변수 설정만 포함)

---

## 2. API 키 보안 설정

**프롬프트**:
```
OpenRouter에서 받은 API 키를 .env 파일로 저장했어.
이 키를 안전하게 사용할 수 있도록 준비해줘
```

**작업 내용**:
- `.gitignore` 파일 생성 (`.env` 파일 제외)
- `.env.example` 파일 생성 (템플릿)
- `README.md` 파일 생성 (환경 설정 가이드)

**결과**:
- API 키가 git에 커밋되지 않도록 안전하게 설정
- 다른 개발자를 위한 환경변수 템플릿 제공

---

## 3. Python 프로젝트 설정

**프롬프트**:
```
Python으로 할게
```

**작업 내용**:
- `requirements.txt` 생성 (python-dotenv, requests)
- `config.py` 생성 (환경변수 로드)

**결과**:
- Python 프로젝트 기본 구조 준비

---

## 4. uv 가상환경 설정

**프롬프트**:
```
uv를 사용하여 가상환경을 먼저 진행한 후 실행해줘
```

**작업 내용**:
- `uv venv`로 가상환경 생성
- `requirements.txt` 파일 작성
- `uv pip install -r requirements.txt`로 의존성 설치
- `config.py` 생성 (환경변수 로드 및 검증)
- `example.py` 생성 (OpenRouter API 사용 예제)

**결과**:
- 가상환경 `.venv/` 생성
- 필요한 패키지 설치 완료:
  - python-dotenv==1.0.0
  - requests==2.31.0
  - certifi, charset-normalizer, idna, urllib3 (의존성)
- OpenRouter API 호출 테스트 성공

---

## 5. 텍스트 및 이미지 인식 테스트

**프롬프트**:
```
이미지 인식은 google/gemma-3-27b-it:free 모델을 이용하고
텍스트 인식은 솔라 모델을 이용할꺼야
API를 통한 텍스트와 이미지 인식을 각각 테스트해서 실행 결과를 알려줘
정확한 모델명은 .env파일에 주석으로 적어놨어. 주석을 해제하고 사용하면 됩니다.
```

**작업 내용**:
- `.env` 파일 업데이트 (모델명 환경변수 추가)
  - `TEXT_MODEL=upstage/solar-pro-3:free`
  - `IMAGE_MODEL=google/gemma-3-27b-it:free`
- `config.py` 업데이트 (모델명 환경변수 로드)
- `test_api.py` 생성 (텍스트 및 이미지 인식 통합 테스트)

**결과**:
- ✅ 텍스트 인식 성공 (Solar 모델)
  - Python 리스트/튜플 차이점을 상세하게 설명
- ❌ 이미지 인식 실패 (Gemma 27B 모델)
  - 429 Rate Limit 에러 발생

---

## 6. 이미지 인식 재시도 및 대체 모델 탐색

**프롬프트**:
```
이미지 인식도 시도해줘
```

**작업 내용**:
- `test_image_only.py` 생성 (재시도 로직 포함)
- 웹 검색으로 다른 무료 멀티모달 모델 탐색
- `test_image_alternative.py` 생성 (여러 모델 자동 시도)
- 다음 모델들 시도:
  - `meta-llama/llama-3.2-11b-vision-instruct:free` (404 에러)
  - `qwen/qwen2.5-vl-3b-instruct:free` (404 에러)
  - `google/gemma-3-12b-it:free` (✅ 성공!)

**결과**:
- ✅ 이미지 인식 성공 (Gemma 12B 모델)
  - 고양이 이미지를 정확하게 분석
  - 털 색상, 얼굴 특징, 표정, 배경까지 상세히 설명
- `.env` 파일 업데이트: `IMAGE_MODEL=google/gemma-3-12b-it:free`

---

## 7. OpenRouter Rate Limit 정책 조사

**프롬프트**:
```
오픈 라우터의 RATE LIMIT 정책을 웹에서 찾아주세요
```

**작업 내용**:
- 웹 검색으로 OpenRouter rate limit 정책 조사
- 공식 문서 확인 (https://openrouter.ai/docs/api/reference/limits)

**결과**:
- 무료 티어 제한 확인:
  - 기본: 20 requests/minute, 50 requests/day
  - $10 구매 시: 20 requests/minute, 1,000 requests/day
- Provider upstream rate limit 정책 확인
- 429 에러 원인 파악

---

## 8. README.md 업데이트

**프롬프트**:
```
오픈라우터의 조사된 리밋 정보를 README.md 파일에 업데이트 해줘
```

**작업 내용**:
- README.md에 "OpenRouter Rate Limit 정책" 섹션 추가
- 무료 티어 제한, 추가 제한 사항, 사용량 확인 방법 문서화
- Rate limit 대처 방법 추가
- 사용 가능한 모델 목록 업데이트
- 프로젝트 구조에 테스트 파일들 추가
- 사용 방법 섹션 확장

**결과**:
- 포괄적인 README.md 완성
- 다른 개발자들이 rate limit 정책을 쉽게 이해할 수 있도록 문서화

---

## 9. Git 커밋

**프롬프트**:
```
현재까지 내용을 커밋해주세요
```

**작업 내용**:
- `git init`으로 저장소 초기화
- 파일 staging:
  - .env.example
  - .gitignore
  - CLAUDE.md
  - README.md
  - config.py
  - example.py
  - requirements.txt
  - test_api.py
  - test_image_alternative.py
  - test_image_only.py
- 의미 있는 커밋 메시지 작성 및 커밋

**결과**:
- 커밋 해시: `40e8a8d`
- 10개 파일, 619줄 추가
- `.env` 파일은 .gitignore로 안전하게 제외

---

## 프로젝트 최종 상태

### 설치된 패키지
```
python-dotenv==1.0.0
requests==2.31.0
```

### 사용 중인 모델
- **텍스트 생성**: `upstage/solar-pro-3:free`
- **이미지 인식**: `google/gemma-3-12b-it:free`

### 생성된 주요 파일
1. **config.py**: 환경변수 로드 및 API 설정
2. **example.py**: 기본 텍스트 생성 예제
3. **test_api.py**: 텍스트 + 이미지 통합 테스트
4. **test_image_only.py**: 이미지 인식 전용 (재시도 로직)
5. **test_image_alternative.py**: 여러 모델 자동 시도
6. **README.md**: 프로젝트 문서 (rate limit 정책 포함)
7. **CLAUDE.md**: Claude Code 가이드

### 테스트 결과
- ✅ 텍스트 인식: 정상 작동
- ✅ 이미지 인식: 정상 작동 (대체 모델 사용)
- ✅ Rate limit 처리: 재시도 로직 및 대체 모델 자동 전환

### 보안
- ✅ API 키는 `.env` 파일에 저장
- ✅ `.gitignore`로 `.env` 파일 제외
- ✅ `.env.example`로 템플릿 제공

---

## 참고 자료

- [OpenRouter Models](https://openrouter.ai/models)
- [OpenRouter API Rate Limits Documentation](https://openrouter.ai/docs/api/reference/limits)
- [OpenRouter Free Models](https://openrouter.ai/collections/free-models)
- [18 Free AI Models on OpenRouter (2026)](https://www.teamday.ai/blog/best-free-ai-models-openrouter-2026)
