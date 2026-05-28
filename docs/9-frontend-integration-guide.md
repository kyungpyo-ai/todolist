# 프론트엔드 통합 가이드 — TodoList 앱

| 항목 | 내용 |
|------|------|
| 버전 | 1.0 |
| 작성일 | 2026-05-28 |
| 참조 문서 | PRD v1.2, 도메인 정의서 v1.2, swagger.json (OpenAPI 3.0.3) |

---

## 목차

1. [기술 스택](#1-기술-스택)
2. [API 기본 설정](#2-api-기본-설정)
3. [응답 구조](#3-응답-구조)
4. [인증 흐름](#4-인증-흐름)
5. [API 엔드포인트 상세](#5-api-엔드포인트-상세)
6. [클라이언트 측 비즈니스 규칙 검증](#6-클라이언트-측-비즈니스-규칙-검증)
7. [화면별 API 연동](#7-화면별-api-연동)
8. [상태 관리 설계](#8-상태-관리-설계)
9. [에러 처리 패턴](#9-에러-처리-패턴)

---

## 1. 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| UI | React 19 + TypeScript | 컴포넌트 렌더링 |
| 빌드 | Vite | 개발 서버 및 번들링 |
| 서버 상태 | TanStack Query (React Query) | API 데이터 fetching / 캐싱 / 동기화 |
| 클라이언트 상태 | Zustand | JWT 토큰, 사용자 정보, UI 상태 |
| 다국어 [v2] | i18next + react-i18next | UI 언어 전환 |
| 테마 [v2] | CSS 변수 또는 Tailwind dark 클래스 | 다크/라이트 모드 |

---

## 2. API 기본 설정

### 베이스 URL

```
개발: http://localhost:3000
```

### 공통 요청 헤더

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>   ← 인증이 필요한 모든 요청에 포함
```

### Axios 인스턴스 예시

```typescript
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: Authorization 헤더 자동 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 시 로그아웃 처리
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Swagger UI

개발 서버 실행 시 `http://localhost:3000/api-docs` 에서 전체 API 명세 확인 및 직접 테스트 가능.

---

## 3. 응답 구조

모든 API 응답은 아래 두 가지 형식 중 하나를 따릅니다.

### 성공 응답

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
}
```

**리소스별 `data` 키 규칙:**

| 엔드포인트 | data 구조 |
|-----------|-----------|
| POST /api/auth/signup | `{ user: User }` |
| POST /api/auth/login | `{ token: string, user: User }` |
| GET /api/users/me | `{ user: User }` |
| PATCH /api/users/me | `{ user: User }` |
| DELETE /api/users/me | `null` |
| GET /api/categories | `{ categories: Category[] }` |
| POST /api/categories | `{ category: Category }` |
| PATCH /api/categories/:id | `{ category: Category }` |
| DELETE /api/categories/:id | `null` |
| GET /api/todos | `{ todos: Todo[] }` |
| POST /api/todos | `{ todo: Todo }` |
| GET /api/todos/:id | `{ todo: Todo }` |
| PATCH /api/todos/:id | `{ todo: Todo }` |
| DELETE /api/todos/:id | `null` |

### 실패 응답

```typescript
interface ErrorResponse {
  success: false;
  message: string;  // 사용자에게 표시할 메시지
  code: string;     // 에러 코드 (아래 코드 목록 참조)
}
```

**에러 코드 목록:**

| code | HTTP 상태 | 의미 |
|------|-----------|------|
| `UNAUTHORIZED` | 401 | 인증 토큰 없음 또는 유효하지 않음 |
| `INVALID_CREDENTIALS` | 401 | 이메일/비밀번호 불일치 |
| `FORBIDDEN` | 403 | 접근 권한 없음 (타인 데이터 접근 시도) |
| `DEFAULT_CATEGORY_PROTECTED` | 403 | 기본 카테고리 수정/삭제 시도 (BR-07) |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `EMAIL_CONFLICT` | 409 | 이미 사용 중인 이메일 (BR-09) |
| `INVALID_EMAIL` | 400 | 이메일 형식 오류 |
| `WEAK_PASSWORD` | 400 | 비밀번호 조건 미충족 |
| `INVALID_PASSWORD` | 400 | 비밀번호 불일치 (탈퇴 시 본인 확인) |
| `MISSING_TODO_TITLE` | 400 | 할일 제목 미입력 |
| `INVALID_DATE_RANGE` | 400 | 종료일 < 시작일 (BR-04) |
| `INVALID_STATUS_TRANSITION` | 400 | 허용되지 않는 상태 전이 (BR-05) |
| `MISSING_CATEGORY_NAME` | 400 | 카테고리 이름 미입력 |
| `INVALID_THEME` | 400 | 허용되지 않는 테마 값 [v2] |
| `INVALID_LANGUAGE` | 400 | 허용되지 않는 언어 코드 [v2] |
| `VALIDATION_ERROR` | 400 | 기타 유효성 오류 |

### TypeScript 타입 정의

```typescript
interface User {
  id: string;        // UUID
  email: string;
  name: string;
  theme?: 'light' | 'dark';     // v2
  language?: 'ko' | 'en';       // v2
  createdAt: string; // ISO 8601 datetime
  updatedAt: string;
}

interface Category {
  id: string;        // UUID
  userId: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Todo {
  id: string;        // UUID
  userId: string;
  categoryId: string;
  title: string;
  description: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. 인증 흐름

### JWT 저장 전략

JWT 토큰은 **메모리(Zustand 스토어)** 에 저장합니다. 새로고침 시 세션 유지가 필요하다면 `localStorage` 또는 `sessionStorage`를 병행 사용합니다.

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

### 인증 상태 흐름

```
앱 초기화
  ↓
토큰 존재 여부 확인 (Zustand/localStorage)
  ├─ 없음 → 로그인 화면(SCR-01)으로 리다이렉트
  └─ 있음 → 보호 라우트 접근 허용

로그인 성공
  ↓
token + user → Zustand 스토어 저장
  ↓
할일 목록 화면(SCR-03)으로 이동

API 응답 401 수신
  ↓
Zustand 스토어 초기화 (token = null, user = null)
  ↓
로그인 화면(SCR-01)으로 리다이렉트

회원 탈퇴 완료
  ↓
Zustand 스토어 초기화
  ↓
로그인 화면(SCR-01)으로 이동
```

### 라우트 보호

```typescript
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

---

## 5. API 엔드포인트 상세

### 5-1. Auth

#### 회원가입

```
POST /api/auth/signup
```

**요청:**
```json
{
  "email": "user@example.com",
  "password": "pass1234",
  "name": "홍길동"
}
```

**성공 응답 (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "홍길동",
      "createdAt": "2026-05-28T00:00:00.000Z",
      "updatedAt": "2026-05-28T00:00:00.000Z"
    }
  }
}
```

**실패 케이스:**
- 400: `INVALID_EMAIL`, `WEAK_PASSWORD`
- 409: `EMAIL_CONFLICT` (이미 가입된 이메일)

**클라이언트 검증 (제출 전):**
- 이메일 형식 (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- 비밀번호 최소 8자, 영문+숫자 포함 (`/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/`)
- 이름 필수 입력

---

#### 로그인

```
POST /api/auth/login
```

**요청:**
```json
{
  "email": "user@example.com",
  "password": "pass1234"
}
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "uuid", "email": "...", "name": "..." }
  }
}
```

**실패 케이스:**
- 401: `INVALID_CREDENTIALS` (이메일 미존재 또는 비밀번호 불일치 — 보안상 원인 구분 없음)

**로그인 성공 후:**
```typescript
const { token, user } = res.data.data;
useAuthStore.getState().setAuth(token, user);
navigate('/todos');
```

---

### 5-2. Users

모든 Users 엔드포인트는 `Authorization: Bearer <token>` 헤더 필수.

#### 내 정보 조회

```
GET /api/users/me
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": { "user": { ...User } }
}
```

---

#### 내 정보 수정

```
PATCH /api/users/me
```

**요청 (수정할 필드만 포함):**
```json
// 이름 변경
{ "name": "김철수" }

// 비밀번호 변경
{ "password": "newpass1234" }
```

> **주의:** `theme`, `language` 필드는 v2에서 지원됩니다. v1에서는 전송하지 마세요.

**성공 응답 (200):**
```json
{
  "success": true,
  "data": { "user": { ...User } }
}
```

**실패 케이스:**
- 400: `WEAK_PASSWORD`
- 401: `UNAUTHORIZED`

---

#### 회원 탈퇴

```
DELETE /api/users/me
```

**요청:**
```json
{ "password": "pass1234" }
```

**성공 응답 (200):**
```json
{ "success": true, "data": null }
```

**실패 케이스:**
- 400: `INVALID_PASSWORD`
- 401: `UNAUTHORIZED`

**탈퇴 완료 후:**
```typescript
useAuthStore.getState().logout();
navigate('/login');
```

---

### 5-3. Categories

모든 Categories 엔드포인트는 인증 필수.

#### 카테고리 목록 조회

```
GET /api/categories
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      { "id": "uuid", "name": "기본", "isDefault": true, ... },
      { "id": "uuid", "name": "업무", "isDefault": false, ... }
    ]
  }
}
```

> `isDefault: true` 항목이 반드시 1개 이상 포함됩니다.

---

#### 카테고리 생성

```
POST /api/categories
```

**요청:**
```json
{ "name": "개인" }
```

**성공 응답 (201):**
```json
{
  "success": true,
  "data": { "category": { "id": "uuid", "name": "개인", "isDefault": false, ... } }
}
```

**실패 케이스:**
- 400: `MISSING_CATEGORY_NAME`

---

#### 카테고리 수정

```
PATCH /api/categories/:id
```

**요청:**
```json
{ "name": "업무 프로젝트" }
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": { "category": { ...Category } }
}
```

**실패 케이스:**
- 403: `DEFAULT_CATEGORY_PROTECTED` (기본 카테고리 수정 시도, BR-07)
- 403: `FORBIDDEN` (타인 카테고리)
- 404: `NOT_FOUND`

> UI에서 `isDefault: true` 인 카테고리의 수정 버튼은 비활성화(disabled)로 표시하여 요청 자체를 차단하세요 (BR-07).

---

#### 카테고리 삭제

```
DELETE /api/categories/:id
```

**성공 응답 (200):**
```json
{ "success": true, "data": null }
```

**삭제 시 연쇄 효과:** 해당 카테고리에 속한 모든 할일의 `categoryId`가 자동으로 기본 카테고리 ID로 변경됩니다.

**실패 케이스:**
- 403: `DEFAULT_CATEGORY_PROTECTED` (기본 카테고리 삭제 시도, BR-07)
- 403: `FORBIDDEN`
- 404: `NOT_FOUND`

---

### 5-4. Todos

모든 Todos 엔드포인트는 인증 필수.

#### 할일 목록 조회

```
GET /api/todos
GET /api/todos?categoryId={uuid}
GET /api/todos?status={NOT_STARTED|IN_PROGRESS|DONE}
GET /api/todos?overdue=true
```

**쿼리 파라미터:**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `categoryId` | UUID (optional) | 카테고리 필터 |
| `status` | string (optional) | 상태 필터 (`NOT_STARTED` \| `IN_PROGRESS` \| `DONE`) |
| `overdue` | boolean (optional) | `true` 시 기한 초과 미완료(`endDate < 오늘 AND status != DONE`) 필터 |

> `overdue=true` 와 `status` 를 함께 전달하면 `overdue` 조건이 우선 적용됩니다.

**성공 응답 (200):**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "uuid",
        "categoryId": "uuid",
        "title": "보고서 작성",
        "description": "분기별 성과 보고서",
        "startDate": "2026-05-28",
        "endDate": "2026-05-31",
        "status": "IN_PROGRESS",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

> 해당하는 할일이 없으면 빈 배열 `[]` 을 반환합니다 (404가 아님).

---

#### 할일 단건 조회

```
GET /api/todos/:id
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": { "todo": { ...Todo } }
}
```

**실패 케이스:**
- 403: `FORBIDDEN`
- 404: `NOT_FOUND`

---

#### 할일 등록

```
POST /api/todos
```

**요청:**
```json
{
  "title": "보고서 작성",
  "description": "분기별 성과 보고서",  // optional
  "startDate": "2026-05-28",
  "endDate": "2026-05-31",
  "categoryId": "uuid"                  // optional — 미지정 시 기본 카테고리 자동 적용 (BR-03)
}
```

**필수 필드:** `title`, `startDate`, `endDate`

**성공 응답 (201):**
```json
{
  "success": true,
  "data": {
    "todo": {
      "id": "uuid",
      "status": "NOT_STARTED",  // 등록 시 항상 NOT_STARTED
      ...
    }
  }
}
```

**실패 케이스:**
- 400: `MISSING_TODO_TITLE`, `INVALID_DATE_RANGE` (BR-04)

---

#### 할일 수정

```
PATCH /api/todos/:id
```

**요청 (수정할 필드만 포함):**
```json
// 상태 변경
{ "status": "IN_PROGRESS" }

// 제목·날짜 변경
{ "title": "수정된 제목", "endDate": "2026-06-01" }

// 카테고리 변경
{ "categoryId": "uuid" }
```

**성공 응답 (200):**
```json
{
  "success": true,
  "data": { "todo": { ...Todo } }
}
```

**실패 케이스:**
- 400: `INVALID_DATE_RANGE` (BR-04), `INVALID_STATUS_TRANSITION` (BR-05)
- 403: `FORBIDDEN`
- 404: `NOT_FOUND`

---

#### 할일 삭제

```
DELETE /api/todos/:id
```

**성공 응답 (200):**
```json
{ "success": true, "data": null }
```

**실패 케이스:**
- 403: `FORBIDDEN`
- 404: `NOT_FOUND`

---

## 6. 클라이언트 측 비즈니스 규칙 검증

서버 요청 전 클라이언트에서 미리 검증하여 불필요한 API 호출을 줄이고 즉각적인 피드백을 제공합니다.

### BR-04: 날짜 유효성 (`endDate >= startDate`)

```typescript
function validateDateRange(startDate: string, endDate: string): boolean {
  return endDate >= startDate; // YYYY-MM-DD 문자열 비교 가능
}
```

오류 메시지: "종료일은 시작일 이후여야 합니다"

---

### BR-05: Todo 상태 전이 제한

```typescript
const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  NOT_STARTED: ['IN_PROGRESS'],
  IN_PROGRESS: ['NOT_STARTED', 'DONE'],
  DONE: ['IN_PROGRESS'],
};

function getAllowedNextStatuses(currentStatus: string): string[] {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];
}
```

수정 폼에서 상태 드롭다운은 허용된 전이 목록만 활성화하고 나머지는 비활성화(disabled)합니다.

---

### BR-07: 기본 카테고리 보호

```typescript
// isDefault: true 인 카테고리는 수정/삭제 버튼 비활성화
<button disabled={category.isDefault}>수정</button>
<button disabled={category.isDefault}>삭제</button>
```

---

### BR-09: 이메일 중복 (서버 응답 기반)

이메일 중복 여부는 서버에서만 판단 가능합니다. `code === 'EMAIL_CONFLICT'` 응답 시 이메일 필드 아래에 "이미 사용 중인 이메일입니다" 메시지를 인라인으로 표시합니다.

---

### 기한 초과 (Overdue) 판별 — UI 표시용

```typescript
function isOverdue(todo: Todo): boolean {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return todo.endDate < today && todo.status !== 'DONE';
}
```

목록 화면에서 할일 카드에 기한 초과 뱃지를 표시할 때 사용합니다.

---

## 7. 화면별 API 연동

### SCR-01 로그인 화면

| 액션 | API 호출 |
|------|----------|
| 로그인 버튼 클릭 | `POST /api/auth/login` |

**성공 후:** `data.token` 과 `data.user` 를 Zustand에 저장 → `/todos` 로 이동

---

### SCR-02 회원가입 화면

| 액션 | API 호출 |
|------|----------|
| 가입하기 버튼 클릭 | `POST /api/auth/signup` |

**성공 후:** 로그인 화면(SCR-01)으로 이동

---

### SCR-03 할일 목록 화면

| 액션 | API 호출 |
|------|----------|
| 화면 진입 | `GET /api/categories`, `GET /api/todos` |
| 카테고리 필터 변경 | `GET /api/todos?categoryId={id}` |
| 상태 필터 변경 | `GET /api/todos?status={status}` |
| 기한 초과 필터 토글 | `GET /api/todos?overdue=true` |
| 삭제 확인 | `DELETE /api/todos/:id` |

**TanStack Query 키 예시:**
```typescript
// 카테고리 목록
useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

// 할일 목록 (필터 포함)
useQuery({ queryKey: ['todos', filters], queryFn: () => fetchTodos(filters) })

// 삭제 후 무효화
const mutation = useMutation({
  mutationFn: (id: string) => deleteTodo(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
});
```

---

### SCR-04 할일 등록/수정 화면

| 액션 | API 호출 |
|------|----------|
| 폼 열기 (카테고리 드롭다운) | `GET /api/categories` |
| 수정 폼 열기 | `GET /api/todos/:id` |
| 저장 (등록) | `POST /api/todos` |
| 저장 (수정) | `PATCH /api/todos/:id` |

**저장 성공 후:** `queryClient.invalidateQueries(['todos'])` → 목록 화면으로 이동

---

### SCR-05 카테고리 관리 화면

| 액션 | API 호출 |
|------|----------|
| 화면 진입 | `GET /api/categories` |
| 생성 버튼 클릭 | `POST /api/categories` |
| 수정 저장 | `PATCH /api/categories/:id` |
| 삭제 확인 | `DELETE /api/categories/:id` |

---

### SCR-06 내 정보 화면

| 액션 | API 호출 |
|------|----------|
| 화면 진입 | `GET /api/users/me` |
| 저장 버튼 클릭 | `PATCH /api/users/me` |
| 회원 탈퇴 확인 | `DELETE /api/users/me` |

---

## 8. 상태 관리 설계

### Zustand: 클라이언트 전역 상태

```typescript
// stores/authStore.ts — JWT + 사용자 정보
interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}
```

### TanStack Query: 서버 상태

```typescript
// 권장 queryKey 구조
['categories']                          // 카테고리 목록
['todos']                               // 전체 할일 목록
['todos', { categoryId, status, overdue }]  // 필터 적용 목록
['todos', id]                           // 단건
['user', 'me']                          // 내 정보
```

### 캐시 무효화 규칙

| 뮤테이션 | 무효화 대상 |
|----------|------------|
| 카테고리 생성/수정/삭제 | `['categories']`, `['todos']` (카테고리 삭제 시 할일 카테고리 변경됨) |
| 할일 생성/수정/삭제 | `['todos']` |
| 내 정보 수정 | `['user', 'me']` |
| 회원 탈퇴 | 모든 쿼리 초기화 |

---

## 9. 에러 처리 패턴

### 전역 에러 처리 (Axios 인터셉터)

```typescript
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
```

### 화면별 에러 처리

**인라인 오류 표시 (필드 수준):**

| code | 표시 위치 | 메시지 |
|------|-----------|--------|
| `EMAIL_CONFLICT` | 이메일 필드 하단 | "이미 사용 중인 이메일입니다" |
| `INVALID_EMAIL` | 이메일 필드 하단 | "올바른 이메일 형식이 아닙니다" |
| `WEAK_PASSWORD` | 비밀번호 필드 하단 | "비밀번호 조건을 확인해주세요 (8자 이상, 영문+숫자 조합)" |
| `INVALID_PASSWORD` | 비밀번호 필드 하단 | "비밀번호가 일치하지 않습니다" |
| `INVALID_DATE_RANGE` | 날짜 필드 하단 | "종료일은 시작일 이후여야 합니다" |
| `INVALID_STATUS_TRANSITION` | 상태 필드 하단 | "허용되지 않는 상태 전이입니다" |

**토스트/알림 표시 (작업 수준):**

| 상황 | 메시지 |
|------|--------|
| 403 FORBIDDEN | "접근 권한이 없습니다" |
| 404 NOT_FOUND | "요청한 항목을 찾을 수 없습니다" |
| 500 서버 오류 | "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요" |

### 에러 응답 파싱 유틸리티

```typescript
function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.success === false && data?.message) {
      return data.message;
    }
  }
  return '알 수 없는 오류가 발생했습니다';
}

function getErrorCode(error: unknown): string | null {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.code ?? null;
  }
  return null;
}
```

---

## 부록: API 엔드포인트 전체 목록

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/api/auth/signup` | 불필요 | 회원가입 |
| POST | `/api/auth/login` | 불필요 | 로그인 |
| GET | `/api/users/me` | 필요 | 내 정보 조회 |
| PATCH | `/api/users/me` | 필요 | 내 정보 수정 |
| DELETE | `/api/users/me` | 필요 | 회원 탈퇴 |
| GET | `/api/categories` | 필요 | 카테고리 목록 조회 |
| POST | `/api/categories` | 필요 | 카테고리 생성 |
| PATCH | `/api/categories/:id` | 필요 | 카테고리 수정 |
| DELETE | `/api/categories/:id` | 필요 | 카테고리 삭제 |
| GET | `/api/todos` | 필요 | 할일 목록 조회 (필터 지원) |
| POST | `/api/todos` | 필요 | 할일 등록 |
| GET | `/api/todos/:id` | 필요 | 할일 단건 조회 |
| PATCH | `/api/todos/:id` | 필요 | 할일 수정 |
| DELETE | `/api/todos/:id` | 필요 | 할일 삭제 |
| GET | `/api/health` | 불필요 | 서버 상태 확인 |
