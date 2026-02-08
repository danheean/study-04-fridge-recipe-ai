# JWT 인증 시스템 설정 가이드

## 개요

FridgeChef 프로젝트에 JWT(JSON Web Token) 기반 인증 시스템이 구현되었습니다. 이제 모든 사용자는 회원가입 및 로그인을 통해 인증된 상태에서만 API를 사용할 수 있습니다.

## 주요 변경사항

### 보안 강화
- ✅ JWT 토큰 기반 인증 (HS256 알고리즘)
- ✅ 비밀번호 bcrypt 해싱
- ✅ 모든 API 엔드포인트 보호
- ✅ 본인 데이터만 접근 가능
- ✅ 관리자 권한 엄격히 검증

### 새로운 기능
- ✅ 회원가입 (`/api/auth/register`)
- ✅ 로그인 (`/api/auth/login`)
- ✅ 비밀번호 재설정 (기존 사용자용, `/api/auth/reset-password`)
- ✅ 자동 로그아웃 (토큰 만료 시)

---

## 설치 및 설정

### 1. 의존성 설치

```bash
cd backend
uv pip install -r requirements.txt
```

새로 추가된 패키지:
- `python-jose[cryptography]==3.3.0` - JWT 토큰 생성/검증
- `passlib[bcrypt]==1.7.4` - 비밀번호 해싱

### 2. 환경 변수 설정

`.env` 파일에 JWT_SECRET_KEY 추가:

```bash
# 랜덤 키 생성
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

생성된 키를 `.env` 파일에 추가:

```bash
JWT_SECRET_KEY=<생성된_랜덤_키>
```

`.env` 파일 예시:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
JWT_SECRET_KEY=abc123xyz456def789ghi012jkl345mno678pqr901stu234
TEXT_MODEL=upstage/solar-pro-3:free
IMAGE_MODEL=google/gemma-3-12b-it:free
```

### 3. 데이터베이스 마이그레이션

User 테이블에 `password_hash` 컬럼 추가:

```bash
python backend/migrate_add_password.py
```

출력 예시:
```
🔄 password_hash 컬럼을 추가하는 중...
✅ password_hash 컬럼이 성공적으로 추가되었습니다!

📊 사용자 통계:
   - 전체 사용자: 5명
   - 비밀번호 설정됨: 0명
   - 비밀번호 미설정 (마이그레이션 필요): 5명

ℹ️  기존 사용자는 /api/auth/reset-password 엔드포인트를 통해 비밀번호를 설정할 수 있습니다.

✅ 마이그레이션 완료!
```

### 4. 데모 사용자 생성

테스트용 데모 계정 생성:

```bash
python backend/create_demo_user.py
```

출력 예시:
```
✅ 데모 사용자가 성공적으로 생성되었습니다!
   - 이메일: demo@fridgechef.com
   - 비밀번호: demo1234
   - ID: abc123-def456-ghi789
```

---

## 사용 방법

### 테스트 계정으로 로그인

프론트엔드에서 로그인 모달을 열고:

- **이메일**: `demo@fridgechef.com`
- **비밀번호**: `demo1234`

### 새로운 계정 만들기

1. "새 계정 만들기" 버튼 클릭
2. 이름, 이메일, 비밀번호 입력
3. 회원가입 완료 → 자동 로그인

### 기존 사용자 마이그레이션

기존 사용자 (password_hash가 NULL인 경우):

1. 로그인 시도
2. "비밀번호가 설정되지 않은 계정입니다" 에러 발생
3. 비밀번호 재설정 페이지로 이동
4. 새 비밀번호 입력
5. 정상 로그인 가능

---

## API 변경사항

### 인증이 필요한 엔드포인트

모든 사용자 및 레시피 관련 API는 이제 JWT 토큰이 필요합니다:

#### 사용자 API (`/api/users/*`)
- `GET /api/users/{user_id}` - 본인 또는 관리자만
- `PUT /api/users/{user_id}` - 본인만
- `PUT /api/users/{user_id}/preferences` - 본인만
- `POST /api/users/{user_id}/recipes` - 본인만
- `GET /api/users/{user_id}/recipes` - 본인만
- `DELETE /api/users/{user_id}/recipes/{recipe_id}` - 본인만
- `GET /api/users/{user_id}/stats` - 본인만

#### 이미지 API (`/api/images/*`)
- `POST /api/images/analyze` - 로그인 필요 (user_id 자동 설정)

#### 관리자 API (`/api/admin/*`)
- `GET /api/admin/users` - 관리자만
- `GET /api/admin/stats` - 관리자만
- `DELETE /api/admin/users/{user_id}` - 관리자만
- `PUT /api/admin/users/{user_id}/admin` - 관리자만

### 새로운 엔드포인트

#### 인증 API (`/api/auth/*`)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/reset-password` - 비밀번호 재설정 (기존 사용자용)

---

## 프론트엔드 변경사항

### axios 인터셉터

JWT 토큰이 자동으로 모든 요청에 추가됩니다:

```javascript
Authorization: Bearer <token>
```

### 자동 로그아웃

401 Unauthorized 응답 시 자동으로 로그아웃 처리:
- localStorage 초기화
- 로그인 모달 표시

### AuthContext 변경

- `login(email, password)` - 비밀번호 추가
- `register(email, password, name)` - 새 회원가입 함수
- JWT 토큰 및 사용자 정보 localStorage 저장

---

## 보안 고려사항

### 비밀번호 보안
- **해싱**: bcrypt 알고리즘 사용
- **최소 길이**: 8자 이상
- **저장**: 평문 비밀번호는 절대 저장하지 않음

### JWT 토큰
- **알고리즘**: HS256 (HMAC SHA-256)
- **만료 시간**: 24시간
- **저장 위치**: localStorage (프론트엔드)
- **전송**: Authorization 헤더 (Bearer 토큰)

### API 보안
- **권한 확인**: 모든 보호된 엔드포인트에서 사용자 검증
- **본인 데이터만**: user_id는 JWT 토큰에서 추출 (URL 파라미터 신뢰 안 함)
- **관리자 검증**: is_admin 플래그 JWT 토큰에서 확인

### 프로덕션 권장사항
- ✅ HTTPS 사용 필수
- ✅ JWT_SECRET_KEY 32자 이상의 강력한 랜덤 문자열 사용
- ✅ CORS 설정 프론트엔드 도메인만 허용
- ⚠️ Refresh Token 구현 고려 (현재는 Access Token만 사용)

---

## 테스트 시나리오

### 1. 회원가입 플로우
```
1. 회원가입 페이지 접속 (/register)
2. 이름, 이메일, 비밀번호 입력
3. "회원가입" 버튼 클릭
4. ✅ JWT 토큰 발급, 자동 로그인
5. ✅ 홈 페이지로 리다이렉트
```

### 2. 로그인 플로우
```
1. 로그인 모달 열기
2. 이메일 + 비밀번호 입력
3. "로그인" 버튼 클릭
4. ✅ JWT 토큰 발급
5. ✅ 모달 닫힘, 사용자 이름 표시
```

### 3. 보호된 API 호출
```
1. 로그인 상태에서 이미지 업로드
2. ✅ Authorization 헤더에 Bearer 토큰 자동 추가
3. ✅ 백엔드에서 토큰 검증 성공
4. ✅ 이미지 분석 정상 완료
```

### 4. 토큰 만료 처리
```
1. 24시간 경과 후 API 요청
2. ✅ 401 Unauthorized 응답
3. ✅ axios interceptor가 자동 로그아웃 처리
4. ✅ localStorage 초기화, 로그인 모달 표시
```

### 5. 권한 검증
```
1. 일반 사용자로 로그인
2. 관리자 페이지 접속 시도
3. ✅ 403 Forbidden 응답
4. ✅ "관리자 권한이 필요합니다" 메시지
```

---

## 트러블슈팅

### 문제: JWT_SECRET_KEY 에러
```
ValueError: JWT_SECRET_KEY가 설정되지 않았습니다.
```

**해결**: `.env` 파일에 JWT_SECRET_KEY 추가

---

### 문제: 로그인 시 401 에러
```
{"detail": "이메일 또는 비밀번호가 올바르지 않습니다"}
```

**원인**:
1. 이메일 또는 비밀번호 오타
2. 비밀번호가 설정되지 않은 계정

**해결**:
- 데모 계정 사용: `demo@fridgechef.com` / `demo1234`
- 비밀번호 재설정: `/api/auth/reset-password`

---

### 문제: password_hash 컬럼이 없음
```
sqlite3.OperationalError: table users has no column named password_hash
```

**해결**: 마이그레이션 실행
```bash
python backend/migrate_add_password.py
```

---

### 문제: 프론트엔드에서 자동 로그아웃
```
401 Unauthorized 반복 발생
```

**원인**: JWT 토큰 만료 또는 유효하지 않음

**해결**:
1. localStorage 확인: `accessToken` 키 존재 여부
2. 토큰 만료 확인 (24시간)
3. 다시 로그인

---

## 다음 단계 (선택사항)

향후 확장 가능한 기능:

1. **Refresh Token**: 1시간 Access Token + 30일 Refresh Token
2. **이메일 인증**: 회원가입 시 이메일 확인 링크 발송
3. **소셜 로그인**: Google, GitHub OAuth 연동
4. **2FA (Two-Factor Authentication)**: 2단계 인증
5. **비밀번호 복잡도 강화**: 대문자, 숫자, 특수문자 포함 요구
6. **Rate Limiting**: 무차별 대입 공격 방어

---

## 참고 자료

- [JWT 공식 문서](https://jwt.io/)
- [FastAPI 보안 가이드](https://fastapi.tiangolo.com/tutorial/security/)
- [OWASP 인증 모범 사례](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
