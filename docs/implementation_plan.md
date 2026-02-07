# 구현 계획: FridgeChef 웹 애플리케이션

## 프로젝트 구조

```
study-04/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 앱 진입점
│   │   ├── config.py          # 설정 관리
│   │   ├── models/            # 데이터 모델
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── ingredient.py
│   │   │   └── recipe.py
│   │   ├── schemas/           # Pydantic 스키마
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── ingredient.py
│   │   │   └── recipe.py
│   │   ├── api/               # API 라우트
│   │   │   ├── __init__.py
│   │   │   ├── images.py
│   │   │   ├── recipes.py
│   │   │   └── users.py
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── __init__.py
│   │   │   ├── image_service.py
│   │   │   ├── recipe_service.py
│   │   │   └── openrouter_service.py
│   │   ├── db/                # 데이터베이스
│   │   │   ├── __init__.py
│   │   │   ├── database.py
│   │   │   └── session.py
│   │   └── utils/             # 유틸리티
│   │       ├── __init__.py
│   │       └── image_utils.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/                   # React 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Loading.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── IngredientList.jsx
│   │   │   ├── RecipeCard.jsx
│   │   │   └── RecipeDetail.jsx
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── Home.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── RecipeList.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/          # API 클라이언트
│   │   │   └── api.js
│   │   ├── hooks/             # Custom Hooks
│   │   │   └── useRecipes.js
│   │   ├── context/           # Context API
│   │   │   └── UserContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── docs/                       # 문서
│   ├── PRD.md
│   ├── implementation_plan.md
│   └── PROMPT.md
│
├── config.py                   # OpenRouter 설정 (기존)
├── .env
├── .env.example
└── README.md
```

---

## 구현 단계별 계획

### Phase 1: 프로젝트 설정 (Day 1-2)

#### 1.1 백엔드 설정

**작업 항목**:
- [ ] FastAPI 프로젝트 구조 생성
- [ ] 의존성 설치 (`requirements.txt` 업데이트)
- [ ] 데이터베이스 설정 (SQLite)
- [ ] CORS 설정
- [ ] 환경변수 관리

**필요한 패키지**:
```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
pydantic==2.5.3
python-multipart==0.0.6
pillow==10.2.0
python-dotenv==1.0.0
requests==2.31.0
```

**핵심 파일**:
- `backend/app/main.py`
- `backend/app/config.py`
- `backend/app/db/database.py`

#### 1.2 프론트엔드 설정

**작업 항목**:
- [ ] Vite + React 프로젝트 생성
- [ ] Tailwind CSS 설정
- [ ] 라우팅 설정 (React Router)
- [ ] 기본 레이아웃 구성

**설치 명령**:
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom axios
npx tailwindcss init -p
```

**핵심 파일**:
- `frontend/src/App.jsx`
- `frontend/tailwind.config.js`
- `frontend/src/services/api.js`

---

### Phase 2: 이미지 인식 기능 (Day 3-5)

#### 2.1 백엔드: 이미지 업로드 및 분석 API

**작업 항목**:
- [ ] 이미지 업로드 엔드포인트 구현
- [ ] 이미지 전처리 (리사이징, 최적화)
- [ ] OpenRouter API 연동 (이미지 인식)
- [ ] 재료 추출 로직 구현
- [ ] 응답 데이터 포맷팅

**구현 파일**:
1. `backend/app/services/openrouter_service.py`
```python
import requests
import base64
from typing import List, Dict
from app.config import settings

class OpenRouterService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
        self.image_model = settings.IMAGE_MODEL
        self.text_model = settings.TEXT_MODEL

    async def analyze_image(self, image_base64: str) -> List[Dict]:
        """이미지에서 재료 추출"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        prompt = """
        이 냉장고 사진을 분석하여 보이는 모든 재료를 JSON 형식으로 추출해주세요.

        출력 형식:
        {
          "ingredients": [
            {
              "name": "재료명",
              "quantity": "수량 (대략적)",
              "freshness": "신선도 (fresh/moderate/expiring)",
              "confidence": "인식 확신도 (0-1)"
            }
          ]
        }
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
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                        }
                    ]
                }
            ]
        }

        # API 호출 및 응답 처리
        response = requests.post(self.api_url, headers=headers, json=data)
        response.raise_for_status()

        result = response.json()
        # JSON 파싱 및 반환
        return self._parse_ingredients(result)
```

2. `backend/app/api/images.py`
```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.openrouter_service import OpenRouterService
from app.utils.image_utils import process_image

router = APIRouter(prefix="/api/images", tags=["images"])
openrouter = OpenRouterService()

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """이미지 업로드 및 재료 인식"""
    try:
        # 이미지 처리
        image_base64 = await process_image(file)

        # AI 분석
        ingredients = await openrouter.analyze_image(image_base64)

        return {
            "success": True,
            "ingredients": ingredients,
            "image_id": "generated_uuid"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 2.2 프론트엔드: 이미지 업로드 UI

**작업 항목**:
- [ ] 이미지 업로드 컴포넌트
- [ ] 드래그 앤 드롭 기능
- [ ] 이미지 미리보기
- [ ] 로딩 상태 관리

**구현 파일**:
`frontend/src/components/ImageUpload.jsx`
```jsx
import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function ImageUpload({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    // 미리보기
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // 업로드
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/images/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      onUpload(data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-emerald-300 rounded-2xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
      ) : (
        <div className="space-y-4">
          <Upload className="w-16 h-16 mx-auto text-emerald-500" />
          <p className="text-xl font-medium text-gray-700">
            냉장고 사진을 업로드하세요
          </p>
          <p className="text-sm text-gray-500">
            드래그 앤 드롭 또는 클릭하여 선택
          </p>
        </div>
      )}

      {loading && <p className="mt-4 text-emerald-600">분석 중...</p>}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
```

---

### Phase 3: 레시피 생성 기능 (Day 6-8)

#### 3.1 백엔드: 레시피 생성 API

**작업 항목**:
- [ ] 재료 기반 레시피 생성 로직
- [ ] OpenRouter 텍스트 모델 연동
- [ ] 레시피 데이터 구조화
- [ ] 캐싱 구현 (동일 재료 요청 시)

**구현 파일**:
`backend/app/services/recipe_service.py`
```python
class RecipeService:
    def __init__(self):
        self.openrouter = OpenRouterService()

    async def generate_recipes(
        self,
        ingredients: List[str],
        preferences: Dict = None
    ) -> List[Dict]:
        """재료 기반 레시피 생성"""

        prompt = self._build_recipe_prompt(ingredients, preferences)

        response = await self.openrouter.generate_text(prompt)
        recipes = self._parse_recipes(response)

        return recipes

    def _build_recipe_prompt(self, ingredients: List[str], preferences: Dict) -> str:
        ingredients_str = ", ".join(ingredients)

        prompt = f"""
        다음 재료를 사용하여 만들 수 있는 레시피 3개를 추천해주세요:
        재료: {ingredients_str}

        각 레시피는 다음 JSON 형식으로 제공해주세요:
        {{
          "recipes": [
            {{
              "title": "요리 이름",
              "description": "간단한 설명",
              "ingredients": [
                {{"name": "재료명", "quantity": "수량", "available": true}}
              ],
              "instructions": ["단계1", "단계2", ...],
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
        - 조리시간은 분 단위로 표시
        """

        if preferences:
            if preferences.get('dietary_restrictions'):
                prompt += f"\n식단 제한: {preferences['dietary_restrictions']}"
            if preferences.get('excluded_ingredients'):
                prompt += f"\n제외할 재료: {preferences['excluded_ingredients']}"

        return prompt
```

#### 3.2 프론트엔드: 레시피 표시 UI

**작업 항목**:
- [ ] 재료 목록 편집 컴포넌트
- [ ] 레시피 카드 컴포넌트
- [ ] 레시피 상세 모달
- [ ] 필터/정렬 기능

**구현 파일**:
`frontend/src/components/RecipeCard.jsx`
```jsx
import React from 'react';
import { Clock, ChefHat, Flame } from 'lucide-react';

export default function RecipeCard({ recipe, onSelect }) {
  const difficultyColor = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
      onClick={() => onSelect(recipe)}
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {recipe.description}
        </p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{recipe.cooking_time}분</span>
          </div>

          <div className="flex items-center gap-1 text-gray-600">
            <Flame className="w-4 h-4" />
            <span>{recipe.calories}kcal</span>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor[recipe.difficulty]}`}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            재료 {recipe.ingredients.filter(i => i.available).length}/{recipe.ingredients.length} 보유
          </div>

          <ChefHat className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 4: 사용자 프로필 기능 (Day 9-11)

#### 4.1 백엔드: 사용자 및 저장 기능

**작업 항목**:
- [ ] 사용자 모델 구현
- [ ] 레시피 저장/삭제 API
- [ ] 저장된 레시피 조회 API
- [ ] 사용자 선호도 관리

**데이터베이스 모델**:
`backend/app/models/user.py`
```python
from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    name = Column(String)
    preferences = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_recipes = relationship("SavedRecipe", back_populates="user")
```

#### 4.2 프론트엔드: 프로필 페이지

**작업 항목**:
- [ ] 저장된 레시피 목록
- [ ] 선호도 설정 폼
- [ ] 조리 이력

---

### Phase 5: UI/UX 개선 및 최적화 (Day 12-14)

#### 5.1 디자인 개선

**작업 항목**:
- [ ] 반응형 디자인 구현
- [ ] 애니메이션 추가
- [ ] 접근성 개선 (ARIA 라벨)
- [ ] 다크 모드 (선택)

#### 5.2 성능 최적화

**작업 항목**:
- [ ] 이미지 압축 및 최적화
- [ ] API 응답 캐싱
- [ ] Lazy Loading
- [ ] Code Splitting

---

### Phase 6: 테스트 및 배포 (Day 15-16)

#### 6.1 테스트

**작업 항목**:
- [ ] 단위 테스트 (백엔드)
- [ ] 통합 테스트 (API)
- [ ] E2E 테스트 (프론트엔드)
- [ ] 성능 테스트

#### 6.2 배포

**작업 항목**:
- [ ] Docker 컨테이너화
- [ ] 환경변수 설정
- [ ] CI/CD 파이프라인
- [ ] 모니터링 설정

**배포 플랫폼**:
- Frontend: Vercel
- Backend: Railway / Fly.io
- Database: PostgreSQL (Production)

---

## 기술적 고려사항

### 1. Rate Limit 관리

**전략**:
- 요청 캐싱 (Redis)
- 사용자당 일일 요청 제한
- 대체 모델 자동 전환
- 에러 처리 및 재시도 로직

### 2. 이미지 처리

**최적화**:
```python
from PIL import Image
import io

def optimize_image(image_bytes: bytes, max_size: int = 1024) -> bytes:
    """이미지 리사이징 및 최적화"""
    img = Image.open(io.BytesIO(image_bytes))

    # 리사이징
    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    # JPEG 변환 및 압축
    output = io.BytesIO()
    img.convert('RGB').save(output, format='JPEG', quality=85, optimize=True)

    return output.getvalue()
```

### 3. 보안

**조치 사항**:
- HTTPS 강제
- CORS 설정
- API 키 암호화
- 입력 검증 및 sanitization
- Rate limiting

### 4. 에러 처리

**백엔드**:
```python
from fastapi import HTTPException

async def handle_openrouter_error(error):
    if error.status_code == 429:
        raise HTTPException(
            status_code=429,
            detail="일일 요청 한도를 초과했습니다. 내일 다시 시도해주세요."
        )
    elif error.status_code == 500:
        raise HTTPException(
            status_code=500,
            detail="AI 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
        )
```

---

## 다음 단계

1. ✅ PRD 검토 및 승인
2. ✅ 구현 계획 검토
3. ⏭️ Phase 1 시작: 프로젝트 설정
4. ⏭️ 백엔드 및 프론트엔드 기반 구축
5. ⏭️ 핵심 기능 구현

---

## 참고 자료

- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
- [React 공식 문서](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenRouter API 문서](https://openrouter.ai/docs)
