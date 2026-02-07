# 🔧 FridgeChef 개선 체크리스트

## ✅ 즉시 적용 가능 (30분 이내)

### 1. 코드 중복 제거 ✅
- [x] `frontend/src/utils/constants.js` 파일 생성
- [x] `DIFFICULTY_COLORS`, `DIFFICULTY_TEXT` 상수 통합
- [x] RecipeList.jsx, Profile.jsx에서 import로 변경

### 2. ARIA 접근성 기본 추가 ✅
- [x] ImageUpload: input에 `aria-label="이미지 파일 선택"` 추가
- [x] 버튼에 `aria-label` 추가
- [x] 로딩 상태에 `aria-busy="true"` 추가

### 3. alert() → 토스트 알림 ✅
- [x] RecipeList: alert() 제거, 토스트로 대체
- [x] Profile: alert() 제거, 토스트로 대체
- [x] App.jsx: alert() 제거, 토스트로 대체

### 4. 입력 검증 추가 ✅
- [x] Profile.jsx: 선호도 입력 길이 제한 (100자)
- [x] Profile.jsx: 빈 값 체크
- [x] Profile.jsx: 중복 항목 제거
- [x] 사용자 친화적 검증 메시지
- [x] 입력 힌트 추가 (aria-describedby)

### 5. 에러 메시지 개선 ✅
- [x] 사용자 친화적 메시지로 변경
- [x] 기술적 에러는 콘솔에만 표시
- [x] errorHandler.js 유틸리티 생성
- [x] axios 인터셉터로 자동 에러 처리
- [x] 모든 컴포넌트에 error.userMessage 적용

---

## 🔴 CRITICAL - 이번 주 내 완료

### 6. 에러 바운더리 추가 ✅ (1시간)
```bash
touch frontend/src/components/ErrorBoundary.jsx
# 구현 후 App.jsx에서 감싸기
```

**우선순위**: 🔥 최상
**영향도**: 앱 안정성
**난이도**: 쉬움
**완료일**: 2026-02-07

### 7. ImageUpload.user_id 추가 ✅ (30분)
```bash
# backend/app/models/image_upload.py 수정
# migration 또는 DB 재생성
```

**우선순위**: 🔥 최상
**영향도**: 데이터 무결성
**난이도**: 쉬움
**완료일**: 2026-02-07

### 8. Pydantic 검증 강화 ✅ (1시간)
```python
# backend/app/schemas/recipe.py
# Field validators 추가
```

**우선순위**: 🔥 최상
**영향도**: 보안, 데이터 품질
**난이도**: 보통
**완료일**: 2026-02-07

---

## ⚠️ HIGH PRIORITY - 2주 내 완료

### 9. 토스트 알림 시스템 ✅ (3시간)
- [x] Toast.jsx 컴포넌트 생성
- [x] ToastContext 및 useToast hook
- [x] alert() 모두 대체 (confirm() 제외)

**우선순위**: 🟠 높음
**영향도**: UX 향상
**난이도**: 보통
**완료일**: 2026-02-07

### 10. 응답 형식 통일 ✅ (2시간)
- [x] backend/app/schemas/common.py 생성
- [x] ApiResponse 모델 정의
- [ ] 모든 API 응답 통일 (추후 작업)

**우선순위**: 🟠 높음
**영향도**: 개발 용이성
**난이도**: 보통
**완료일**: 2026-02-07 (기반 구축)

### 11. 접근성 완전 구현 ✅ (4시간)
- [x] 모든 컴포넌트에 ARIA 속성 (role, aria-label, aria-labelledby, aria-describedby)
- [x] 키보드 네비게이션 (Tab, Enter, ESC 키, 포커스 트랩)
- [x] 색상 + 텍스트 정보 제공 (스크린 리더용 텍스트)
- [x] 시맨틱 HTML 교체 (nav, section, article, header, footer, dl/dt/dd)

**우선순위**: 🟠 높음
**영향도**: 법적 요구사항, 포용성
**난이도**: 보통
**완료일**: 2026-02-08

---

## 🟡 MEDIUM PRIORITY - 1개월 내 완료

### 12. 로딩 상태 통합 ✅ (2시간)
- [x] Context API로 전역 로딩 상태 (LoadingContext)
- [x] 일관된 스켈레톤 UI (SkeletonRecipeCard, SkeletonProfileCard 등)
- [x] LoadingSpinner 컴포넌트
- [x] RecipeList, Profile 페이지에 스켈레톤 UI 적용
- [x] 전역 로딩 오버레이 컴포넌트

**우선순위**: 🟡 중간
**영향도**: UX 일관성
**난이도**: 보통
**완료일**: 2026-02-08

### 13. 비동기 최적화 ✅ (3시간)
- [x] requests → httpx (비동기 HTTP 클라이언트)
- [x] 재시도 로직 (tenacity) - 3회 재시도, 지수 백오프
- [x] 동시성 제어 (connection limits, timeout 설정)
- [x] 구조화된 로깅 (logger.py)
- [x] API 엔드포인트에 상세 로깅 추가

**우선순위**: 🟡 중간
**영향도**: 성능, 안정성
**난이도**: 보통
**완료일**: 2026-02-08

### 14. 페이지네이션 ✅ (2시간)
- [x] 백엔드: skip/limit 쿼리 파라미터 (최대 100개 제한)
- [x] 백엔드: total, has_more 응답 필드 추가
- [x] 프론트엔드: "더 보기" 버튼으로 추가 로딩
- [x] 프론트엔드: 로딩 상태 표시
- [x] API: getSavedRecipes에 페이지네이션 파라미터 추가

**우선순위**: 🟡 중간
**영향도**: 확장성, 성능
**난이도**: 쉬움
**완료일**: 2026-02-08

### 15. 구조화된 로깅 ✅ (1시간)
- [x] logger.py 생성 (setup_logger, get_logger)
- [x] 로그 포맷 설정 (타임스탬프, 모듈, 레벨, 함수, 라인)
- [x] 로그 레벨 설정 (INFO, WARNING, ERROR)
- [x] 모든 API와 서비스에 로거 적용
- [x] 에러 추적 (exc_info=True)

**우선순위**: 🟡 중간
**영향도**: 모니터링, 디버깅
**난이도**: 쉬움
**완료일**: 2026-02-08

---

## 🎯 사용자 요청 기능 추가

### 21. 파비콘 추가 ✅
- [x] SVG 파비콘 생성 (요리사 모자 디자인)
- [x] index.html에 적용
- [x] 페이지 타이틀 및 메타 정보 업데이트

**완료일**: 2026-02-07

### 22. AI 분석 결과 레이아웃 개선 ✅
- [x] 분석 완료 후 2컬럼 레이아웃 (좌: 분석 정보, 우: 재료)
- [x] AnalysisInfo 컴포넌트 생성
- [x] AI 모델, 분석 시간, 파일 정보 표시
- [x] 반응형 디자인

**완료일**: 2026-02-07

### 23. 이미지 재업로드 버그 수정 ✅
- [x] ImageUpload에 ref 추가
- [x] 파일 input 초기화 로직
- [x] "새로 시작하기" 시 완전 초기화
- [x] useImperativeHandle로 reset 함수 노출

**완료일**: 2026-02-07

### 24. 저장된 레시피 상세보기 ✅
- [x] RecipeDetailModal 컴포넌트 생성
- [x] 레시피 카드 클릭 시 모달 표시
- [x] 재료, 조리법 전체 정보 표시
- [x] 모바일 친화적 UI

**완료일**: 2026-02-07

### 25. 프로필 등록 화면 추가 ✅
- [x] /register 라우트 추가
- [x] RegisterPage.jsx 생성
- [x] 이름, 이메일 입력 폼
- [x] 유효성 검증
- [x] 선호도 설정 (선택사항)

**우선순위**: 🟠 높음
**완료일**: 2026-02-07

### 26. 레시피 저장 시 로그인/등록 플로우 ✅
- [x] AuthContext 생성
- [x] LoginModal 컴포넌트
- [x] 레시피 저장 시 인증 확인
- [x] localStorage 사용자 ID 저장
- [x] 로그인 성공 후 원래 작업 자동 수행

**우선순위**: 🟠 높음
**완료일**: 2026-02-07

---

## 🟢 LOW PRIORITY - 선택적

### 16. 확인 다이얼로그 커스텀 ✅ (2시간)
- [x] ConfirmDialog.jsx 생성
- [x] ConfirmContext 및 useConfirm hook
- [x] confirm() 대체 (Profile.jsx)
- [x] 접근성: role="alertdialog", ESC 키, 포커스 트랩
- [x] danger/primary variant 지원

**우선순위**: 🟢 낮음
**영향도**: UX 미세 개선
**난이도**: 쉬움
**완료일**: 2026-02-08

### 17. 모바일 터치 최적화 ✅ (2시간)
- [x] 버튼 크기 44px 이상 (min-h-[44px], min-h-[48px])
- [x] active: 클래스로 피드백 (active:scale-95, active:scale-90)
- [x] 간격 조정 (p-3, px-4 py-3 등)
- [x] 9개 컴포넌트 최적화:
  - App.jsx, ImageUpload.jsx, IngredientList.jsx
  - RecipeList.jsx, Profile.jsx
  - ConfirmDialog.jsx, LoginModal.jsx
  - RecipeDetailModal.jsx, RegisterPage.jsx

**우선순위**: 🟢 낮음
**영향도**: 모바일 UX
**난이도**: 쉬움
**완료일**: 2026-02-08

### 18. API 버전 관리 (2시간)
- [ ] /api/v1/... 경로 변경
- [ ] v1 디렉토리 구조

**우선순위**: 🟢 낮음
**영향도**: 향후 확장성
**난이도**: 쉬움

### 19. 캐싱 시스템 (3시간)
- [ ] 인메모리 캐시 (Map)
- [ ] 캐시 무효화 로직

**우선순위**: 🟢 낮음
**영향도**: 성능 (트래픽 많을 때)
**난이도**: 보통

### 20. 테스트 작성 (진행 중)
- [ ] pytest 설정
- [ ] 유닛 테스트 작성
- [ ] 통합 테스트

**우선순위**: 🟢 낮음 (하지만 중요)
**영향도**: 코드 품질
**난이도**: 높음

---

## 📌 향후 백로그 (FUTURE BACKLOG)

### 27. 관리 기능 - 백엔드 상태 및 시작/정지
- [ ] 백엔드 서버 상태 확인 API
- [ ] 프론트엔드에 서버 상태 표시 (연결됨/끊김)
- [ ] 백엔드 시작/정지 버튼 (개발 환경용)
- [ ] 서버 로그 실시간 모니터링
- [ ] 헬스 체크 엔드포인트 강화

**우선순위**: 🟡 중간
**영향도**: 개발 편의성, 모니터링
**난이도**: 보통
**예상 시간**: 3-4시간

---

## 📊 진행 상황 트래킹

**완료**: 23 / 27 (85%)
**진행 중**: 0 / 27
**대기 중**: 4 / 27

**완료된 항목**: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10(부분), 11, 12, 13, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26
**백로그**: 27 (관리 기능)

**목표 일정**:
- 1주차: CRITICAL 항목 완료 (6-8번)
- 2주차: HIGH PRIORITY 항목 완료 (9-11번)
- 3-4주차: MEDIUM PRIORITY 항목 선택 구현

---

## 💰 투자 대비 효과 (ROI)

| 항목 | 시간 | 효과 | ROI |
|------|------|------|-----|
| 에러 바운더리 | 1h | 🔥🔥🔥 안정성 | ⭐⭐⭐⭐⭐ |
| 코드 중복 제거 | 30m | 🛠️ 유지보수성 | ⭐⭐⭐⭐⭐ |
| ARIA 기본 | 30m | ♿ 접근성 | ⭐⭐⭐⭐ |
| 토스트 시스템 | 3h | 😊 UX | ⭐⭐⭐⭐ |
| Pydantic 검증 | 1h | 🔒 보안 | ⭐⭐⭐⭐ |
| ImageUpload.user_id | 30m | 📊 데이터 | ⭐⭐⭐⭐ |

---

## 🎯 이번 주 추천 작업 (8시간)

1. **월요일** (2h): 코드 중복 제거 + ARIA 기본
2. **화요일** (2h): 에러 바운더리 + 입력 검증
3. **수요일** (2h): ImageUpload.user_id + Pydantic 검증
4. **목요일** (2h): 토스트 시스템 (부분 구현)

**완료 시 효과**:
- ✅ 앱 안정성 향상
- ✅ 보안 강화
- ✅ 코드 품질 개선
- ✅ 접근성 기본 확보
