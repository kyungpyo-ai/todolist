# 실행 계획 — TodoList 앱

| 항목 | 내용 |
|------|------|
| 버전 | v1.0 |
| 작성일 | 2026-05-28 |
| 참조 문서 | PRD v1.2, 도메인 정의서 v1.2, 설계 원칙 v1.0, ERD v1.0 |

---

## 전체 실행 순서 요약

```
[DB 셋업] → [백엔드 기반] → [백엔드 인증] → [백엔드 도메인 API]
                                                      ↓
                          [프론트엔드 기반] → [프론트 인증] → [프론트 도메인 화면]
                                                                      ↓
                                                              [v2 기능 (테마/다국어)]
```

---

## Task ID 체계

| 접두사 | 영역 |
|--------|------|
| `DB-` | 데이터베이스 |
| `BE-` | 백엔드 |
| `FE-` | 프론트엔드 |

---

## 1. 데이터베이스

---

### DB-01 PostgreSQL 환경 설정

**완료 조건**
- [ ] PostgreSQL 17 설치 및 서비스 실행 확인
- [ ] `todolist` 데이터베이스 생성
- [ ] 접속용 전용 유저 생성 및 권한 부여
- [ ] `.env` 파일에 `DATABASE_URL` 설정 완료
- [ ] `psql` 또는 클라이언트로 접속 성공 확인

**의존성**
- 없음 (시작점)

---

### DB-02 스키마 적용 (DDL 실행)

**완료 조건**
- [ ] `database/schema.sql` 실행 성공 (오류 없음)
- [ ] `users`, `categories`, `todos` 3개 테이블 생성 확인
- [ ] 제약 조건 확인: UNIQUE(email), CHECK(end_date >= start_date), CHECK(status), CHECK(theme), CHECK(language)
- [ ] 인덱스 5개 생성 확인
- [ ] CASCADE DELETE 동작 확인 (users 삭제 시 categories·todos 연쇄 삭제)

**의존성**
- DB-01 완료

---

### DB-03 마이그레이션 파일 관리 구조 수립

**완료 조건**
- [ ] `database/migrations/` 디렉토리 생성
- [ ] `001_initial_schema.sql` — 초기 스키마 (v1 테이블 3개)
- [ ] `002_add_user_theme_language.sql` — v2 theme·language 컬럼 추가용 ALTER 문 작성
- [ ] 마이그레이션 실행 순서 README 또는 주석 명시

**의존성**
- DB-02 완료

---

## 2. 백엔드

---

### BE-01 프로젝트 초기화

**완료 조건**
- [ ] `backend/` 디렉토리 구조 생성 (설계 원칙 섹션 7 기준)
- [ ] `package.json` 초기화, 의존성 설치
  - 런타임: `express`, `pg`, `bcrypt`, `jsonwebtoken`, `cors`, `dotenv`
  - 개발: `nodemon`, `jest`, `supertest`
- [ ] `.env`, `.env.example` 작성 (설계 원칙 섹션 5-1 기준)
- [ ] `src/config/app.js` — Express 앱 설정 (CORS, bodyParser, JSON)
- [ ] `src/config/db.js` — pg Pool 설정 및 연결 테스트 통과
- [ ] `node src/server.js` 실행 시 서버 정상 기동 확인

**의존성**
- DB-01 완료

---

### BE-02 공통 미들웨어 및 유틸리티

**완료 조건**
- [ ] `src/utils/jwt.js` — 토큰 생성(`sign`), 검증(`verify`) 함수
- [ ] `src/utils/password.js` — `bcrypt.hash`, `bcrypt.compare` 래퍼
- [ ] `src/middleware/auth.middleware.js` — JWT 검증, 미인증 시 401 반환 (BR-01)
- [ ] `src/middleware/error.middleware.js` — 전역 에러 핸들러, 통일된 응답 형식 `{ success, message, code }`
- [ ] `src/middleware/logger.middleware.js` — 메서드·경로·상태코드·응답시간 로깅
- [ ] 500 응답에 스택 트레이스 미포함 확인

**의존성**
- BE-01 완료

---

### BE-03 인증 API (UC-01, UC-02)

**완료 조건**
- [ ] `POST /api/auth/signup` — 회원가입
  - [ ] 이메일 형식 검증 (auth.validator.js)
  - [ ] 비밀번호 최소 8자·영문+숫자 조합 검증
  - [ ] 이메일 중복 시 409 반환 (BR-09)
  - [ ] bcrypt 해싱 저장
  - [ ] 가입 즉시 `기본` 카테고리 자동 생성 (BR-03 전제)
- [ ] `POST /api/auth/login` — 로그인
  - [ ] 이메일 미존재 또는 비밀번호 불일치 시 401 반환 (원인 구분 없음)
  - [ ] JWT 토큰 발급 (payload: userId, exp)
- [ ] 단위 테스트: `tests/unit/auth.service.test.js` 작성 및 통과
- [ ] 통합 테스트: `tests/integration/auth.router.test.js` 작성 및 통과

**의존성**
- BE-02 완료, DB-02 완료

---

### BE-04 사용자 API (UC-03, UC-04)

**완료 조건**
- [ ] `GET /api/users/me` — 내 정보 조회 (인증 필요)
- [ ] `PATCH /api/users/me` — 내 정보 수정 (이름, 비밀번호)
  - [ ] 비밀번호 변경 시 조건 검증
  - [ ] 타인 데이터 수정 불가 (BR-06) — auth middleware로 보장
- [ ] `DELETE /api/users/me` — 회원 탈퇴
  - [ ] 비밀번호 확인 후 삭제
  - [ ] users 삭제 시 CASCADE로 categories·todos 연쇄 삭제 (BR-08) 확인
- [ ] 단위 테스트: `tests/unit/user.service.test.js` 작성 및 통과

**의존성**
- BE-03 완료

---

### BE-05 카테고리 API (UC-05, UC-06, UC-07)

**완료 조건**
- [ ] `GET /api/categories` — 본인 카테고리 목록 조회 (BR-02)
- [ ] `POST /api/categories` — 카테고리 생성
  - [ ] 이름 필수 검증 (category.validator.js)
- [ ] `PATCH /api/categories/:id` — 카테고리 수정
  - [ ] `is_default=true` 시 403 반환 (BR-07)
  - [ ] 타인 카테고리 403 반환 (BR-02)
- [ ] `DELETE /api/categories/:id` — 카테고리 삭제
  - [ ] `is_default=true` 시 403 반환 (BR-07)
  - [ ] 삭제 시 해당 카테고리 todos의 category_id를 기본 카테고리로 일괄 변경
- [ ] 단위 테스트: `tests/unit/category.service.test.js` 작성 및 통과
- [ ] 통합 테스트: `tests/integration/category.router.test.js` 작성 및 통과

**의존성**
- BE-03 완료

---

### BE-06 할일 API (UC-08, UC-09, UC-10, UC-11)

**완료 조건**
- [ ] `GET /api/todos` — 할일 목록 조회 (BR-02)
  - [ ] 쿼리 파라미터 필터: `categoryId`, `status`, `overdue`
  - [ ] Overdue 필터: `end_date < 오늘 AND status != DONE`
- [ ] `POST /api/todos` — 할일 등록
  - [ ] 제목 필수, 날짜 형식 검증 (todo.validator.js)
  - [ ] `end_date >= start_date` 검증 (BR-04)
  - [ ] 카테고리 미지정 시 기본 카테고리 자동 적용 (BR-03)
- [ ] `GET /api/todos/:id` — 할일 단건 조회
- [ ] `PATCH /api/todos/:id` — 할일 수정
  - [ ] `end_date >= start_date` 검증 (BR-04)
  - [ ] 허용된 상태 전이만 허용 (BR-05): NOT_STARTED↔IN_PROGRESS, IN_PROGRESS↔DONE
  - [ ] 타인 할일 403 반환 (BR-02)
- [ ] `DELETE /api/todos/:id` — 할일 삭제
  - [ ] 타인 할일 403 반환 (BR-02)
- [ ] 단위 테스트: `tests/unit/todo.service.test.js` 작성 및 통과 (BR-04, BR-05 포함)
- [ ] 통합 테스트: `tests/integration/todo.router.test.js` 작성 및 통과

**의존성**
- BE-05 완료 (기본 카테고리 참조)

---

## 3. 프론트엔드

---

### FE-01 프로젝트 초기화

**완료 조건**
- [ ] `frontend/` Vite + React 19 + TypeScript 프로젝트 생성
- [ ] 의존성 설치
  - 런타임: `zustand`, `@tanstack/react-query`, `react-router-dom`
  - 개발: `vitest`, `@testing-library/react`
- [ ] 디렉토리 구조 생성 (설계 원칙 섹션 6 기준)
- [ ] `src/types/` — `user.ts`, `todo.ts`, `category.ts` TypeScript 인터페이스 정의
- [ ] `src/utils/dateUtils.ts` — 날짜 포맷, `endDate >= startDate` 검증
- [ ] `src/utils/validationUtils.ts` — 이메일, 비밀번호 형식 검증
- [ ] `.env`, `.env.example` 작성 (`VITE_API_BASE_URL` 포함)
- [ ] `npm run dev` 실행 시 빈 화면 정상 표시 확인

**의존성**
- 없음 (BE-01과 병렬 진행 가능)

---

### FE-02 라우팅 및 API 클라이언트 설정

**완료 조건**
- [ ] `react-router-dom` 라우트 설정
  - `/login`, `/signup`, `/todos`, `/categories`, `/profile` 경로 정의
  - 인증 여부에 따른 PrivateRoute 가드 구현 (미인증 시 `/login` 리다이렉트)
- [ ] `src/api/client.ts` — fetch 또는 axios 인스턴스
  - `VITE_API_BASE_URL` 기반 baseURL 설정
  - 요청 헤더에 JWT 토큰 자동 주입
  - 401 응답 시 로그인 화면 자동 리다이렉트
- [ ] `src/stores/authStore.ts` — Zustand 스토어 (토큰, 사용자 정보)
- [ ] `QueryClientProvider` 앱 루트에 설정

**의존성**
- FE-01 완료

---

### FE-03 인증 화면 (UC-01, UC-02)

**완료 조건**
- [ ] `src/api/authApi.ts` — signup, login API 함수
- [ ] `features/auth/hooks/useAuth.ts` — 로그인·회원가입 TanStack Query 뮤테이션
- [ ] `SignupForm.tsx` — 이름·이메일·비밀번호 입력, 클라이언트 검증
  - [ ] 이메일 형식 오류 시 즉시 안내 표시
  - [ ] 비밀번호 조건 미충족 시 즉시 안내 표시
  - [ ] 이메일 중복 서버 오류 표시
- [ ] `LoginForm.tsx` — 이메일·비밀번호 입력
  - [ ] 로그인 성공 시 토큰 저장 후 `/todos` 이동
  - [ ] 실패 시 오류 메시지 표시
- [ ] `SignupPage.tsx`, `LoginPage.tsx` 라우트 연결
- [ ] 브라우저에서 회원가입 → 로그인 → 목록 화면 이동 흐름 수동 확인 (US-01)

**의존성**
- FE-02 완료, BE-03 완료

---

### FE-04 카테고리 화면 (UC-05, UC-06, UC-07)

**완료 조건**
- [ ] `src/api/categoryApi.ts` — 목록 조회, 생성, 수정, 삭제 API 함수
- [ ] `features/category/hooks/useCategoryList.ts` — TanStack Query
- [ ] `CategoryList.tsx` — 목록 표시, 기본 카테고리 편집·삭제 버튼 비활성화
- [ ] `CategoryForm.tsx` — 이름 입력, 생성·수정 처리
- [ ] `CategoryPage.tsx` 라우트 연결
- [ ] 기본 카테고리 삭제 시도 시 버튼 비활성화 확인 (UE-02)

**의존성**
- FE-03 완료, BE-05 완료

---

### FE-05 할일 목록 화면 (UC-09)

**완료 조건**
- [ ] `src/api/todoApi.ts` — 목록 조회 API 함수 (필터 파라미터 포함)
- [ ] `features/todo/hooks/useTodoList.ts` — TanStack Query (필터 상태 연동)
- [ ] `TodoCard.tsx` — 제목, 날짜, 상태, Overdue 여부 표시
- [ ] `TodoList.tsx` — 카드 목록 렌더링, 빈 상태 안내 메시지
- [ ] `TodoFilter.tsx` — 카테고리·상태·기한 초과 필터 UI, 선택 즉시 목록 갱신
- [ ] `TodoListPage.tsx` 라우트 연결
- [ ] 브라우저에서 필터 변경 시 목록 즉시 갱신 확인 (US-02)

**의존성**
- FE-04 완료, BE-06 완료

---

### FE-06 할일 등록/수정 (UC-08, UC-10, UC-11)

**완료 조건**
- [ ] `features/todo/hooks/useTodoForm.ts` — 생성·수정·삭제 TanStack Query 뮤테이션
- [ ] `TodoForm.tsx` — 제목(필수), 설명, 시작일, 종료일, 카테고리, 상태 입력 폼
  - [ ] `endDate >= startDate` 클라이언트 검증, 위반 시 오류 표시 (BR-04, UE-01)
  - [ ] 수정 시 기존 값 폼에 미리 채움
  - [ ] 허용된 상태 전이만 선택 가능하도록 옵션 제한 (BR-05)
- [ ] `ConfirmDialog.tsx` (공통) — 삭제 확인 다이얼로그
- [ ] 삭제 버튼 클릭 → 확인 → 목록에서 즉시 제거 흐름 확인 (UC-11)
- [ ] 수정 완료 후 목록에 변경 내용 반영 확인 (US-02)

**의존성**
- FE-05 완료

---

### FE-07 내 정보 화면 (UC-03, UC-04)

**완료 조건**
- [ ] `src/api/userApi.ts` — 내 정보 조회·수정·탈퇴 API 함수 (PATCH/DELETE `/api/users/me`)
- [ ] `ProfilePage.tsx`
  - [ ] 이름 변경 폼
  - [ ] 비밀번호 변경 폼 (현재·새·확인 3개 입력, 불일치 시 즉시 안내)
  - [ ] 이름·비밀번호 모두 미변경 시 저장 버튼 비활성화
  - [ ] 회원 탈퇴 버튼 → 비밀번호 확인 다이얼로그 → 탈퇴 처리 (UC-04)
- [ ] 탈퇴 후 로컬 토큰 제거 및 로그인 화면 이동 확인

**의존성**
- FE-03 완료, BE-04 완료

---

## 4. v2 기능

---

### FE-08 다크/라이트 모드 (UC-12) [v2]

**완료 조건**
- [ ] `src/styles/theme.css` — CSS 변수 기반 light·dark 테마 정의
- [ ] `src/stores/uiStore.ts` — Zustand 테마 상태 (`theme: 'light' | 'dark'`)
- [ ] 헤더 토글 버튼 클릭 시 즉시 테마 전환
- [ ] `PATCH /api/users/me` 로 `theme` 값 서버 저장
- [ ] 로그인 시 서버에서 받은 `theme` 값으로 자동 적용
- [ ] 서버 저장 실패 시 클라이언트 상태 유지 (예외 흐름)
- [ ] BE-04의 `PATCH /api/users/me` 에 `theme` 필드 처리 추가 확인

**의존성**
- FE-07 완료, DB-03 완료 (v2 컬럼)

---

### FE-09 다국어 (UC-13) [v2]

**완료 조건**
- [ ] `i18next`, `react-i18next` 설치 및 설정
- [ ] `src/i18n/ko.json`, `src/i18n/en.json` — 모든 UI 레이블·버튼·오류 메시지 번역 키 작성
- [ ] `src/stores/uiStore.ts` — Zustand 언어 상태 (`language: 'ko' | 'en'`)
- [ ] `ProfilePage.tsx` 언어 선택 드롭다운 — 선택 즉시 전체 UI 언어 전환
- [ ] `PATCH /api/users/me` 로 `language` 값 서버 저장
- [ ] 로그인 시 서버에서 받은 `language` 값으로 자동 적용
- [ ] BE-04의 `PATCH /api/users/me` 에 `language` 필드 처리 추가 확인

**의존성**
- FE-08 완료 (uiStore 공유)

---

## 5. Task 의존성 요약

```
DB-01
  └─▶ DB-02
        └─▶ DB-03
              └─▶ (FE-08, FE-09 의 v2 컬럼 전제)

DB-01 ──▶ BE-01
              └─▶ BE-02
                    └─▶ BE-03
                          ├─▶ BE-04
                          └─▶ BE-05
                                └─▶ BE-06

FE-01 (BE-01과 병렬 가능)
  └─▶ FE-02
        └─▶ FE-03 ──────────────────────── (BE-03 필요)
              └─▶ FE-04 ─────────────────── (BE-05 필요)
                    └─▶ FE-05 ──────────── (BE-06 필요)
                          └─▶ FE-06
                                └─▶ FE-07 ─ (BE-04 필요)
                                      └─▶ FE-08
                                            └─▶ FE-09
```

---

## 6. v1 Must Have 완료 기준

PRD Must Have(UC-01, UC-02, UC-08, UC-09, UC-10, UC-11) 6개가 모두 동작해야 v1 완료로 간주한다.

| UC | 기능 | 관련 Task |
|----|------|-----------|
| UC-01 | 회원가입 | BE-03, FE-03 |
| UC-02 | 로그인 | BE-03, FE-03 |
| UC-08 | 할일 등록 | BE-06, FE-06 |
| UC-09 | 할일 목록 조회 및 필터 | BE-06, FE-05 |
| UC-10 | 할일 수정 및 상태 전이 | BE-06, FE-06 |
| UC-11 | 할일 삭제 | BE-06, FE-06 |
