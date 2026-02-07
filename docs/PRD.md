# PRD: 냉장고 재료 인식 및 레시피 추천 웹 애플리케이션

## 프로젝트 개요

냉장고 사진을 업로드하면 AI가 재료를 자동으로 인식하고, 해당 재료로 만들 수 있는 레시피를 추천해주는 웹 애플리케이션입니다.

### 프로젝트 이름
**FridgeChef** (가칭)

### 목표
- 냉장고 속 재료를 간편하게 관리
- 재료 낭비 최소화
- 요리 아이디어 제공
- 개인 맞춤형 레시피 추천

---

## 핵심 가치 제안 (Value Proposition)

1. **시간 절약**: 냉장고를 일일이 확인하지 않아도 재료 파악 가능
2. **음식물 쓰레기 감소**: 유통기한 임박 재료 활용 레시피 제안
3. **요리 영감**: 보유 재료로 만들 수 있는 다양한 레시피 발견
4. **개인화**: 사용자 선호도 기반 맞춤형 추천

---

## 주요 기능 (Features)

### Phase 1: MVP (Minimum Viable Product)

#### 1.1 이미지 인식 (Image Recognition)
- **기능**: 냉장고 사진 업로드 시 재료 자동 인식
- **모델**: `google/gemma-3-27b-it:free` (OpenRouter)
- **입력**: 이미지 파일 (JPG, PNG)
- **출력**: 인식된 재료 목록 (JSON 형식)

**인식 항목**:
- 재료 이름
- 수량 (대략적)
- 상태 (신선도 추정)

#### 1.2 레시피 추천 (Recipe Generation)
- **기능**: 인식된 재료 기반 레시피 생성
- **모델**: `upstage/solar-pro-3:free` (OpenRouter)
- **입력**: 재료 목록 + 사용자 선호도
- **출력**: 레시피 목록 (최대 5개)

**레시피 포함 정보**:
- 요리 이름
- 필요한 재료 목록 (보유/부족 재료 구분)
- 조리 시간
- 난이도
- 조리 방법 (단계별)
- 칼로리 정보 (선택)

#### 1.3 사용자 프로필 (User Profile)
- **기능**: 레시피 저장 및 관리
- **저장 정보**:
  - 좋아하는 레시피
  - 조리 이력
  - 선호 음식 카테고리
  - 알레르기/제외 재료

---

## 사용자 플로우 (User Flow)

### 메인 플로우

```
1. 홈페이지 접속
   ↓
2. 냉장고 사진 업로드
   ↓
3. AI 재료 인식 (로딩 인디케이터)
   ↓
4. 인식된 재료 확인/수정
   ↓
5. 레시피 생성 요청
   ↓
6. 추천 레시피 목록 표시
   ↓
7. 레시피 상세 보기
   ↓
8. 레시피 저장 (선택)
```

### 부가 플로우

- **프로필 관리**: 저장된 레시피 보기, 선호도 설정
- **재료 수동 추가**: 이미지 인식 실패 시 직접 입력
- **레시피 검색**: 특정 재료로 레시피 검색

---

## 기술 스택 (Tech Stack)

### Backend
- **언어**: Python 3.10+
- **프레임워크**: FastAPI
- **API**: OpenRouter (LLM 통합)
- **데이터베이스**: SQLite (MVP) / PostgreSQL (Production)
- **ORM**: SQLAlchemy

### Frontend
- **프레임워크**: React + Vite
- **UI 라이브러리**: Tailwind CSS
- **상태 관리**: React Context API / Zustand
- **HTTP 클라이언트**: Axios

### 인프라
- **개발 환경**: uv (Python 패키지 관리)
- **컨테이너**: Docker (선택)
- **배포**: Vercel (Frontend) + Railway/Fly.io (Backend)

---

## UI/UX 요구사항

### 디자인 원칙
1. **모던하고 깔끔한 디자인**
2. **직관적인 인터페이스**
3. **모바일 퍼스트 (Mobile-First)**
4. **빠른 로딩 속도**

### 컬러 스킴
**AI 느낌의 보라색 지양!**

**추천 컬러 팔레트**:
- **Primary**:
  - Fresh Green (#10B981 - Emerald 500)
  - Warm Orange (#F59E0B - Amber 500)
- **Secondary**:
  - Neutral Gray (#6B7280 - Gray 500)
- **Accent**:
  - Deep Blue (#3B82F6 - Blue 500)
- **Background**:
  - White (#FFFFFF)
  - Light Gray (#F9FAFB - Gray 50)

### 주요 화면

#### 1. 홈 화면
- 큰 업로드 버튼 (드래그 앤 드롭 지원)
- 최근 인식한 재료 목록
- 빠른 레시피 검색 바

#### 2. 재료 인식 결과 화면
- 업로드한 이미지 표시
- 인식된 재료 카드 (편집 가능)
- 재료 추가/삭제 버튼
- "레시피 찾기" CTA 버튼

#### 3. 레시피 목록 화면
- 카드 형식 레시피 레이아웃
- 필터/정렬 옵션
- 북마크 아이콘

#### 4. 레시피 상세 화면
- 레시피 이미지 (선택)
- 재료 체크리스트
- 단계별 조리 방법
- 저장/공유 버튼

#### 5. 프로필 화면
- 저장된 레시피
- 선호도 설정
- 조리 이력

---

## 데이터 모델 (Data Model)

### User (사용자)
```python
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "preferences": {
    "dietary_restrictions": ["vegetarian", "gluten-free"],
    "excluded_ingredients": ["peanuts"],
    "favorite_cuisines": ["korean", "italian"]
  },
  "created_at": "timestamp"
}
```

### Ingredient (재료)
```python
{
  "id": "uuid",
  "name": "string",
  "quantity": "string",
  "unit": "string",
  "freshness": "string",  # fresh, moderate, expiring
  "image_id": "uuid",
  "detected_at": "timestamp"
}
```

### Recipe (레시피)
```python
{
  "id": "uuid",
  "title": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "string",
      "available": "boolean"
    }
  ],
  "instructions": ["string"],
  "cooking_time": "integer",  # minutes
  "difficulty": "string",  # easy, medium, hard
  "calories": "integer",
  "created_at": "timestamp",
  "user_id": "uuid",  # if saved
  "is_saved": "boolean"
}
```

### ImageUpload (이미지 업로드)
```python
{
  "id": "uuid",
  "user_id": "uuid",
  "image_url": "string",
  "ingredients_detected": ["uuid"],
  "uploaded_at": "timestamp"
}
```

---

## API 엔드포인트 (API Endpoints)

### 이미지 인식
```
POST /api/images/analyze
- Body: { "image": "base64_string" }
- Response: { "ingredients": [...], "image_id": "uuid" }
```

### 레시피 생성
```
POST /api/recipes/generate
- Body: { "ingredients": [...], "preferences": {...} }
- Response: { "recipes": [...] }
```

### 레시피 저장
```
POST /api/recipes/save
- Body: { "recipe_id": "uuid", "user_id": "uuid" }
- Response: { "success": true }
```

### 사용자 레시피 조회
```
GET /api/users/{user_id}/recipes
- Response: { "recipes": [...] }
```

---

## 성공 지표 (Success Metrics)

### 기술적 지표
- 이미지 인식 정확도: > 80%
- 평균 응답 시간: < 5초
- 시스템 가용성: > 99%

### 사용자 지표
- 일일 활성 사용자(DAU)
- 레시피 저장율
- 사용자 재방문율
- 평균 세션 시간

---

## 제약사항 (Constraints)

### 기술적 제약
1. **OpenRouter Rate Limit**
   - 무료 티어: 20 requests/minute, 50 requests/day
   - 대응: 캐싱, 사용자당 일일 요청 제한

2. **이미지 크기 제한**
   - 최대 10MB
   - 권장: 압축 및 리사이징

3. **인식 정확도**
   - 조명, 각도에 따라 정확도 차이
   - 사용자 수정 기능 필수

### 비즈니스 제약
1. **MVP 개발 기간**: 4주
2. **초기 타겟**: 개인 사용자
3. **수익 모델**: 무료 (MVP 단계)

---

## 향후 개선 사항 (Future Enhancements)

### Phase 2
- 음성 명령 지원
- 영양 정보 상세 분석
- 장보기 목록 자동 생성
- 레시피 공유 커뮤니티

### Phase 3
- 다국어 지원
- 음식 사진 자동 촬영 (카메라 연동)
- 유통기한 추적
- 프리미엄 구독 모델

---

## 리스크 및 대응 방안 (Risks & Mitigation)

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| OpenRouter API rate limit 초과 | 높음 | 캐싱, 대체 모델 준비, 유료 티어 전환 |
| 이미지 인식 정확도 낮음 | 중간 | 수동 편집 기능, 프롬프트 개선 |
| 서버 비용 증가 | 중간 | 최적화, 점진적 스케일링 |
| 사용자 데이터 보안 | 높음 | HTTPS, 암호화, GDPR 준수 |

---

## 타임라인 (Timeline)

### Week 1: 기반 구축
- FastAPI 백엔드 설정
- React 프론트엔드 설정
- 데이터베이스 스키마 설계

### Week 2: 핵심 기능 구현
- 이미지 업로드 및 인식 API
- 레시피 생성 API
- 기본 UI 컴포넌트

### Week 3: 사용자 기능
- 프로필 관리
- 레시피 저장
- UI 개선

### Week 4: 테스트 및 배포
- 통합 테스트
- 성능 최적화
- 배포 및 모니터링

---

## 결론

FridgeChef는 AI 기술을 활용하여 일상적인 요리 고민을 해결하는 실용적인 웹 애플리케이션입니다. OpenRouter API를 기반으로 빠르게 MVP를 구축하고, 사용자 피드백을 통해 지속적으로 개선해 나갈 계획입니다.
