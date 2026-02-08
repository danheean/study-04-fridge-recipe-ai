# FridgeChef - AI 냉장고 레시피 추천 서비스

냉장고 사진을 업로드하면 AI가 재료를 인식하고 맞춤 레시피를 추천해주는 웹 애플리케이션입니다.

## 주요 기능

- 🤖 **AI 재료 인식**: Ollama(gemma3:12b)를 사용한 로컬 이미지 분석
- 🍳 **맞춤 레시피 추천**: OpenRouter API를 통한 레시피 생성
- ✏️ **재료 관리**: 재료 추가/수정/삭제 (이름, 수량, 신선도)
- 🔄 **재분석 기능**: 정확도 높이기, 놓친 재료 찾기, 커스텀 요청
- 👨‍💼 **관리자 기능**: 사용자 관리 및 시스템 통계
- 📧 **이메일 로그인**: 이메일 기반 사용자 인증

## 사전 준비사항

### 1. 필수 소프트웨어 설치

#### Python 3.11+ 설치
```bash
# macOS (Homebrew)
brew install python@3.11

# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv

# Windows
# https://www.python.org/downloads/ 에서 다운로드
```

#### Node.js 18+ 설치
```bash
# macOS (Homebrew)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Windows
# https://nodejs.org/ 에서 LTS 버전 다운로드
```

#### Ollama 설치 (로컬 LLM)
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# https://ollama.com/download 에서 다운로드
```

#### uv 설치 (Python 패키지 관리자, 선택사항)
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 또는 pip 사용
pip install uv
```

### 2. Ollama 모델 다운로드

```bash
# Ollama 서비스 시작
ollama serve  # 백그라운드에서 실행됨

# gemma3:12b 모델 다운로드 (이미지 분석용, 약 7.3GB)
ollama pull gemma3:12b
```

**중요**: gemma3:12b 모델 다운로드는 시간이 걸릴 수 있습니다 (인터넷 속도에 따라 5-30분).

### 3. OpenRouter API 키 발급

1. [OpenRouter](https://openrouter.ai/) 회원가입
2. [API Keys](https://openrouter.ai/keys) 페이지에서 API 키 생성
3. 무료 tier: 50 requests/day (레시피 생성용)

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/danheean/study-04-fridge-recipe-ai.git
cd study-04-fridge-recipe-ai
```

### 2. 백엔드 설정

#### 가상환경 생성 및 활성화

```bash
cd backend

# uv 사용 (권장)
uv venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# 또는 venv 사용
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows
```

#### 의존성 설치

```bash
# uv 사용
uv pip install -r requirements.txt

# 또는 pip 사용
pip install -r requirements.txt
```

#### 환경변수 설정

```bash
# 프로젝트 루트로 이동
cd ..

# .env.example 복사
cp .env.example .env

# .env 파일 편집
nano .env  # 또는 원하는 에디터 사용
```

`.env` 파일 내용:
```bash
# OpenRouter API 키 (필수)
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here

# 개발 모드 (목 데이터 사용하지 않음)
MOCK_MODE=false

# 텍스트 생성 LLM 모델 (레시피 생성용)
TEXT_MODEL=upstage/solar-pro-3:free

# 이미지 분석은 Ollama 사용 (환경변수 불필요)
```

### 3. 데이터베이스 초기화

```bash
cd backend

# 관리자 계정 생성
python create_admin_user.py
```

**기본 관리자 계정**:
- 이메일: `admin@fridgechef.com`
- 비밀번호: `admin123`

⚠️ **프로덕션 환경에서는 반드시 비밀번호를 변경하세요!**

### 4. 백엔드 서버 실행

```bash
# backend 디렉토리에서
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 http://localhost:8000 에서 실행됩니다.

### 5. 프론트엔드 설정 및 실행

**새 터미널**을 열고:

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

## 사용 방법

### 1. 웹 브라우저 접속

http://localhost:5173 으로 접속

### 2. 이미지 업로드

1. "냉장고 사진 업로드" 영역 클릭 또는 드래그 앤 드롭
2. 냉장고 사진 선택 (JPG, PNG, 최대 20MB)
3. AI가 자동으로 재료 분석 (약 10-30초)

### 3. 재료 확인 및 수정

- **재료 추가**: "재료 추가" 버튼 클릭
- **재료 수정**: 재료 카드에 마우스 호버 → 연필 아이콘 클릭
- **재료 삭제**: 재료 카드에 마우스 호버 → 휴지통 아이콘 클릭

### 4. 재료 재분석 (선택사항)

"다시 분석하기" 버튼 클릭 후 옵션 선택:
- 🔍 **정확도 높이기**: 더 세밀한 분석
- 🍎 **놓친 재료 찾기**: 작은 재료까지 꼼꼼히 찾기
- 🔄 **다시 분석**: 같은 조건으로 재분석
- ✏️ **커스텀 요청**: 원하는 분석 방식 직접 입력

### 5. 레시피 생성

"이 재료로 레시피 찾기 🍳" 버튼 클릭

### 6. 레시피 저장

마음에 드는 레시피의 "저장" 버튼 클릭 (로그인 필요)

## 관리자 기능

### 관리자 로그인

1. 우측 상단 "로그인" 클릭
2. 이메일: `admin@fridgechef.com`
3. 비밀번호: `admin123`

### 관리자 대시보드

- 우측 상단 "🛡️ 관리자" 버튼 클릭
- 사용자 목록 조회
- 사용자 삭제
- 관리자 권한 부여/해제
- 시스템 통계 확인

## 프로젝트 구조

```
study-04-fridge-recipe-ai/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── api/               # API 엔드포인트
│   │   │   ├── admin.py       # 관리자 API
│   │   │   ├── images.py      # 이미지 분석 API
│   │   │   ├── recipes.py     # 레시피 생성 API
│   │   │   └── users.py       # 사용자 API
│   │   ├── models/            # 데이터베이스 모델
│   │   ├── schemas/           # Pydantic 스키마
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── ollama_service.py      # Ollama 이미지 분석
│   │   │   └── openrouter_service.py  # OpenRouter 레시피 생성
│   │   ├── utils/             # 유틸리티
│   │   ├── config.py          # 설정
│   │   └── main.py            # FastAPI 앱
│   ├── create_admin_user.py   # 관리자 계정 생성 스크립트
│   ├── requirements.txt       # Python 의존성
│   └── fridgechef.db         # SQLite 데이터베이스
│
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── IngredientList.jsx
│   │   │   ├── RecipeList.jsx
│   │   │   ├── ReanalysisModal.jsx
│   │   │   └── ...
│   │   ├── contexts/          # Context API
│   │   │   ├── AuthContext.jsx
│   │   │   ├── LoadingContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── AdminPage.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/          # API 클라이언트
│   │   │   └── api.js
│   │   ├── utils/             # 유틸리티
│   │   │   └── imageAnalysis.js
│   │   └── App.jsx            # 메인 앱
│   ├── package.json           # Node.js 의존성
│   └── vite.config.js         # Vite 설정
│
├── docs/                       # 문서
│   └── sample/                # 샘플 이미지
├── .env                       # 환경변수 (git 제외)
├── .env.example               # 환경변수 템플릿
└── README.md                  # 이 파일
```

## 기술 스택

### 백엔드
- **FastAPI**: Python 웹 프레임워크
- **SQLAlchemy**: ORM (비동기)
- **SQLite**: 데이터베이스
- **Ollama**: 로컬 LLM (gemma3:12b)
- **OpenRouter**: 클라우드 LLM API (solar-pro-3)
- **Pillow**: 이미지 처리

### 프론트엔드
- **React 18**: UI 프레임워크
- **Vite**: 빌드 도구
- **TailwindCSS**: 스타일링
- **Axios**: HTTP 클라이언트
- **lucide-react**: 아이콘
- **React Router**: 라우팅

## 문제 해결

### Ollama 연결 실패

```bash
# Ollama 서비스 상태 확인
ollama list

# Ollama 재시작
killall ollama
ollama serve
```

### 백엔드 포트 충돌 (8000)

```bash
# 다른 포트로 실행
uvicorn app.main:app --reload --port 8001
```

프론트엔드에서 `.env` 파일 수정:
```bash
VITE_API_URL=http://localhost:8001
```

### 프론트엔드 포트 충돌 (5173)

```bash
# vite.config.js 수정
export default defineConfig({
  server: {
    port: 3000  // 원하는 포트
  }
})
```

### 이미지 분석 너무 느림

gemma3:12b는 약 10-30초 소요됩니다. 더 빠른 모델(qwen3-vl:4b)은 정확도가 낮습니다.

### OpenRouter API 할당량 초과

무료 tier: 50 requests/day
- 다음날까지 대기 (UTC 자정 리셋)
- 또는 $10 크레딧 구매 시 1,000 requests/day

## 보안 주의사항

⚠️ **절대 커밋하면 안 되는 파일**:
- `.env` (API 키 포함)
- `fridgechef.db` (사용자 데이터)
- `.venv/` (가상환경)

⚠️ **프로덕션 배포 시**:
- 관리자 비밀번호 변경
- CORS 설정 수정 (`backend/app/config.py`)
- HTTPS 사용
- 환경변수 암호화

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 문의

문제가 발생하면 [GitHub Issues](https://github.com/danheean/study-04-fridge-recipe-ai/issues)에 등록해주세요.
