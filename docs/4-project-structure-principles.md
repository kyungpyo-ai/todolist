# 프로젝트 구조 설계 원칙 — TodoList 앱

---

## 문서 정보

| 항목      | 내용                                               |
| --------- | -------------------------------------------------- |
| 버전      | v1.0                                               |
| 작성일    | 2026-05-27                                         |
| 참조 문서 | 도메인 정의서 v1.2, PRD v1.2, 사용자 시나리오 v1.0 |

---

## 1. 공통 최상위 원칙

프론트엔드와 백엔드 양쪽에 동일하게 적용되는 아키텍처 원칙이다.

### 1-1. 레이어드 아키텍처

각 스택을 명확한 레이어로 구분하고, 레이어 내부에서만 관련 로직을 처리한다.

> **Why:** 레이어를 구분하면 변경이 발생했을 때 영향 범위가 해당 레이어로 한정된다. 예를 들어 DB를 교체하더라도 서비스 로직을 수정할 필요가 없다.

### 1-2. 단일 책임 원칙 (SRP)

하나의 파일, 클래스, 함수는 하나의 책임만 가진다.

> **Why:** 책임이 분리된 코드는 테스트하기 쉽고, 기능 변경 시 사이드 이펙트가 줄어든다. Todo 상태 전이 검증 로직이 여러 곳에 흩어지지 않도록 단일 위치에 집중한다.

### 1-3. 관심사 분리 (SoC)

UI 렌더링, 비즈니스 로직, 데이터 접근은 각각 분리된 영역에서 처리한다.

> **Why:** 이 프로젝트는 인증(User), 카테고리(Category), 할일(Todo) 세 도메인이 얽혀 있다. 관심사를 분리하면 각 도메인 변경이 다른 도메인에 미치는 영향을 최소화한다.

### 1-4. 오버엔지니어링 금지

현재 요구사항(1인 개발, 1,000명 동시 접속 목표)에 필요한 수준의 설계만 적용한다.

> **Why:** 불필요한 추상화와 패턴은 개발 속도를 낮추고 코드 이해를 어렵게 만든다. 필요한 복잡도 이상은 추가하지 않는다.

### 1-5. 환경별 설정 분리

코드에 하드코딩된 설정값을 두지 않는다. 모든 환경 의존 값은 환경변수로 관리한다.

> **Why:** 개발/운영 환경의 DB 접속 정보, JWT 시크릿 등이 코드에 섞이면 보안 사고와 배포 오류의 원인이 된다.

---

## 2. 의존성/레이어 원칙

### 2-1. 레이어 구조

```
Presentation  (화면 표시 / 요청 수신)
      │
      ▼
Application   (유스케이스 / 비즈니스 흐름 조정)
      │
      ▼
Domain        (핵심 비즈니스 규칙 — User, Category, Todo)
      │
      ▼
Infrastructure (DB, 외부 서비스)
```

> **Why:** 상위 레이어는 하위 레이어에 의존하고, 하위 레이어는 상위 레이어를 모른다. 이 방향을 지키면 DB나 UI를 바꿔도 도메인 규칙(BR-01~BR-11)이 깨지지 않는다.

### 2-2. 프론트엔드 레이어 의존성

```
Component (UI 렌더링)
    │
    ▼
Hook (상태·사이드이펙트 캡슐화)
    │
    ├──▶ Store (Zustand — 전역 클라이언트 상태)
    │
    └──▶ API Client (TanStack Query + fetch — 서버 상태)
```

- `Component`는 직접 `Store`나 `API Client`를 참조하지 않고 `Hook`을 통해서만 접근한다.
- `Store`와 `API Client`는 서로 직접 참조하지 않는다.

> **Why:** Hook이 중간 계층 역할을 하면 컴포넌트가 데이터 출처(서버 상태인지 클라이언트 상태인지)를 알 필요가 없어 재사용성이 높아진다.

### 2-3. 백엔드 레이어 의존성

```
Router (URL 매핑)
    │
    ▼
Controller (요청/응답 처리)
    │
    ▼
Service (비즈니스 로직 — BR 규칙 집행)
    │
    ▼
Repository (SQL 쿼리 실행)
    │
    ▼
DB (PostgreSQL 17)
```

- `Controller`는 HTTP 관련 처리만 한다. 비즈니스 판단을 하지 않는다.
- `Service`는 도메인 규칙(예: BR-04 날짜 유효성, BR-05 상태 전이)을 집행한다.
- `Repository`는 SQL만 담당하며 비즈니스 로직을 포함하지 않는다.
- `pg` 라이브러리를 직접 사용한다. **Prisma는 사용하지 않는다.**

> **Why:** pg 직접 사용은 쿼리 최적화를 직접 제어할 수 있게 해주며, 불필요한 ORM 추상화 레이어 없이 PostgreSQL 17의 기능을 그대로 활용할 수 있다.

### 2-4. 순환 의존성 금지

어떤 레이어도 자신보다 상위 레이어를 import하지 않는다.

> **Why:** 순환 의존성은 빌드 오류, 예측 불가능한 초기화 순서, 테스트 어려움을 유발한다.

---

## 3. 코드/네이밍 원칙

### 3-1. 파일 네이밍

| 대상                | 규칙                         | 예시                                           |
| ------------------- | ---------------------------- | ---------------------------------------------- |
| 프론트엔드 컴포넌트 | PascalCase                   | `TodoCard.tsx`, `CategoryList.tsx`             |
| 프론트엔드 훅       | camelCase, `use` 접두사      | `useTodoList.ts`, `useAuth.ts`                 |
| 프론트엔드 스토어   | camelCase, `Store` 접미사    | `authStore.ts`, `todoStore.ts`                 |
| 프론트엔드 API      | camelCase, `Api` 접미사      | `todoApi.ts`, `categoryApi.ts`                 |
| 프론트엔드 타입     | PascalCase                   | `Todo.ts`, `User.ts`                           |
| 프론트엔드 유틸     | camelCase                    | `dateUtils.ts`, `validationUtils.ts`           |
| 백엔드 라우터       | kebab-case, `.router.js`     | `todo.router.js`, `category.router.js`         |
| 백엔드 컨트롤러     | kebab-case, `.controller.js` | `todo.controller.js`, `auth.controller.js`     |
| 백엔드 서비스       | kebab-case, `.service.js`    | `todo.service.js`, `user.service.js`           |
| 백엔드 레포지토리   | kebab-case, `.repository.js` | `todo.repository.js`, `category.repository.js` |
| 백엔드 미들웨어     | kebab-case, `.middleware.js` | `auth.middleware.js`, `error.middleware.js`    |
| 백엔드 유효성 검사  | kebab-case, `.validator.js`  | `todo.validator.js`, `user.validator.js`       |

> **Why:** 스택별 관행을 따라 React 생태계는 PascalCase 컴포넌트, Node.js 생태계는 kebab-case 모듈 파일명을 사용하면 역할을 파일명만으로 즉시 파악할 수 있다.

### 3-2. 함수/변수 네이밍

- `camelCase`를 사용한다.
- 불리언 변수는 `is`, `has`, `can` 접두사를 붙인다.
- 이벤트 핸들러는 `handle` 접두사를 붙인다.

```
// 좋은 예
const isAuthenticated = true;
const hasDefaultCategory = true;
function handleSubmit() {}
function getTodosByCategory(categoryId) {}

// 나쁜 예
const authenticated = true;
const submit_handler = () => {};
```

> **Why:** 일관된 네이밍은 코드 리뷰 시간을 줄이고 의도를 명확하게 전달한다.

### 3-3. 상수 네이밍

`UPPER_SNAKE_CASE`를 사용한다.

```
const TODO_STATUS = { NOT_STARTED: 'NOT_STARTED', IN_PROGRESS: 'IN_PROGRESS', DONE: 'DONE' };
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;
const DEFAULT_CATEGORY_NAME = '기본';
```

> **Why:** 상수임을 한눈에 식별하여 의도치 않은 재할당을 예방한다.

### 3-4. TypeScript 타입/인터페이스 네이밍 (프론트엔드)

- 타입과 인터페이스 모두 `PascalCase`를 사용한다.
- 도메인 엔티티는 인터페이스(`interface`)로 정의한다.
- API 요청/응답 전용 타입은 `Request`, `Response` 접미사를 붙인다.
- Enum 대신 `as const` 객체를 사용한다.

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}
interface Todo {
  id: string;
  title: string;
  status: TodoStatus;
  startDate: string;
  endDate: string;
}
interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

type CreateTodoRequest = { title: string; startDate: string; endDate: string; categoryId?: string };
type TodoStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE";
```

> **Why:** 도메인 정의서의 User, Category, Todo 엔티티 구조를 타입으로 그대로 반영하면 백엔드 응답과의 불일치를 컴파일 타임에 발견할 수 있다.

### 3-5. API 엔드포인트 네이밍

RESTful 원칙을 따르며 복수 명사를 사용한다.

| 행위                    | 메서드           | 경로                  | 비고 |
| ----------------------- | ---------------- | --------------------- | ---- |
| 회원가입                | POST             | `/api/auth/signup`    |      |
| 로그인                  | POST             | `/api/auth/login`     |      |
| 내 정보 조회/수정/탈퇴  | GET/PATCH/DELETE | `/api/users/me`       |      |
| 카테고리 목록 조회/생성 | GET/POST         | `/api/categories`     |      |
| 카테고리 수정/삭제      | PATCH/DELETE     | `/api/categories/:id` |      |
| 할일 목록 조회/생성     | GET/POST         | `/api/todos`          |      |
| 할일 조회/수정/삭제     | GET/PATCH/DELETE | `/api/todos/:id`      |      |

> **Why:** 복수 명사 기반 RESTful 경로는 HTTP 메서드만으로 의도를 파악할 수 있어 API 문서 없이도 예측 가능하다.

### 3-6. DB 테이블/컬럼 네이밍

`snake_case`를 사용한다.

| 테이블       | 주요 컬럼                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `users`      | `id`, `email`, `password`, `name`, `theme`, `language`, `created_at`, `updated_at`                                     |
| `categories` | `id`, `name`, `user_id`, `is_default`, `created_at`, `updated_at`                                                      |
| `todos`      | `id`, `user_id`, `category_id`, `title`, `description`, `start_date`, `end_date`, `status`, `created_at`, `updated_at` |

> **Why:** PostgreSQL은 기본적으로 식별자를 소문자로 처리하므로 snake_case가 가장 자연스럽다. camelCase를 사용하면 매 쿼리마다 따옴표 처리가 필요해진다.

---

## 4. 테스트/품질 원칙

### 4-1. 테스트 전략

| 종류        | 대상                                                | 도구                               |
| ----------- | --------------------------------------------------- | ---------------------------------- |
| 단위 테스트 | 서비스 비즈니스 로직, 유효성 검사, 유틸 함수        | Jest (백엔드), Vitest (프론트엔드) |
| 통합 테스트 | API 엔드포인트 (라우터 → DB 전체 흐름)              | Jest + Supertest                   |
| E2E 테스트  | 핵심 유저 시나리오 (US-01 회원가입~첫 할일 등록 등) | 선택 사항 (v1 이후 적용 검토)      |

> **Why:** 단위 테스트는 BR-04(날짜 유효성), BR-05(상태 전이) 같은 도메인 규칙 검증에 집중하고, 통합 테스트는 API 계약을 보장한다. E2E는 초기에는 수작업 확인으로 대체한다.

### 4-2. 커버리지 목표

- 백엔드 서비스 레이어: **80% 이상**
- 프론트엔드 유틸/훅: **70% 이상**

> **Why:** 100% 커버리지 목표는 1인 개발 일정에서 비현실적이다. 도메인 규칙이 집중된 서비스 레이어를 우선 보호한다.

### 4-3. 테스트 파일 위치 및 네이밍

**백엔드:**

```
backend/tests/
  unit/
    todo.service.test.js
    category.service.test.js
    user.service.test.js
  integration/
    todo.router.test.js
    auth.router.test.js
```

**프론트엔드:**

```
frontend/src/
  features/todo/
    __tests__/
      useTodoList.test.ts
  utils/
    __tests__/
      dateUtils.test.ts
```

> **Why:** 테스트 파일을 소스와 가까운 위치에 두면(프론트) 또는 별도 디렉토리로 분리하면(백엔드) 탐색이 용이하고 CI에서 수집이 명확하다.

### 4-4. 코드 품질 도구

| 도구     | 적용 범위                  | 설정 파일        |
| -------- | -------------------------- | ---------------- |
| ESLint   | 프론트엔드(TS), 백엔드(JS) | `.eslintrc.json` |
| Prettier | 프론트엔드, 백엔드 공통    | `.prettierrc`    |

- 저장 시 Prettier 자동 포맷을 권장한다.
- ESLint 오류가 있으면 빌드가 실패한다.

> **Why:** 포맷 논쟁 없이 일관된 코드 스타일을 유지하고, 흔한 실수(미사용 변수, `==` 비교 등)를 자동으로 잡아낸다.

---

## 5. 설정/보안/운영 원칙

### 5-1. 환경변수 관리

- 민감 정보는 반드시 `.env` 파일로 관리한다.
- `.env` 파일은 `.gitignore`에 등록하고 레포지토리에 커밋하지 않는다.
- `.env.example` 파일을 레포지토리에 포함하여 필요한 변수 목록을 공유한다.

```
# backend/.env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/todolist
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:5173
```

```
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENV=development
```

- Vite 환경변수는 반드시 `VITE_` 접두사를 붙여야 클라이언트 번들에 포함된다.
- `VITE_` 접두사가 없는 변수는 브라우저에 노출되지 않는다.
- API 토큰 등 민감 정보는 프론트엔드 `.env`에 절대 저장하지 않는다. 프론트엔드 환경변수는 빌드 시 번들에 포함되어 누구나 볼 수 있다.

> **Why:** `.env.example`은 신규 개발자 온보딩 시 누락 변수로 인한 실행 오류를 예방한다.

### 5-2. 시크릿 관리

| 시크릿             | 규칙                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| JWT_SECRET         | 최소 32자 이상의 무작위 문자열. 운영 환경에서는 환경변수 인젝션으로 관리 |
| DB 비밀번호        | 코드에 하드코딩 금지. DATABASE_URL 환경변수 사용                         |
| bcrypt salt rounds | 환경변수로 주입. 기본값 10 (개발), 12 (운영 권장)                        |

> **Why:** PRD에서 bcrypt 해싱이 명시된 만큼 salt rounds도 환경에 따라 튜닝이 필요하다. 운영 환경은 보안을 강화하고 개발 환경은 테스트 속도를 유지한다.

### 5-3. bcrypt 비밀번호 해싱

- 사용자 비밀번호는 평문으로 저장하지 않는다.
- 회원가입(UC-01)과 비밀번호 변경(UC-03) 시 반드시 bcrypt로 해싱한 뒤 저장한다.
- 로그인(UC-02) 시 `bcrypt.compare()`로 검증한다.
- 회원 탈퇴(UC-04) 비밀번호 확인도 동일하게 `bcrypt.compare()`를 사용한다.

> **Why:** PRD 보안 요구사항에 명시된 정책이다. 평문 저장은 DB 유출 시 전체 사용자 계정을 위험에 빠뜨린다.

### 5-4. JWT 토큰 관리

- 토큰 payload에는 `userId`와 `exp`(만료 시각)만 포함한다. 민감 정보는 포함하지 않는다.
- 토큰 만료 시 클라이언트는 로그인 화면으로 리다이렉트한다.
- 별도 세션 저장소 없이 Stateless 방식으로 운용한다(PRD 가정 사항).
- 프론트엔드는 토큰을 `localStorage` 또는 `httpOnly` 쿠키 중 하나로 관리한다. 선택한 방식을 일관되게 유지한다.

> **Why:** Stateless JWT는 수평 확장 시 세션 공유 문제가 없다. PRD의 확장성 요구사항과 일치한다.

### 5-5. CORS 설정

- 허용 오리진은 환경변수(`CORS_ORIGIN`)로 관리한다.
- 개발 환경: `http://localhost:5173`
- 운영 환경: 실제 도메인만 허용
- 와일드카드(`*`) 허용은 운영 환경에서 사용하지 않는다.

> **Why:** 와일드카드 CORS는 CSRF 공격 노출 위험을 높인다.

### 5-6. 에러 핸들링 전략

**백엔드 에러 응답 형식 (일관된 구조):**

```json
{
  "success": false,
  "message": "사용자에게 보여줄 메시지",
  "code": "ERROR_CODE"
}
```

| HTTP 상태 | 사용 시점                                             |
| --------- | ----------------------------------------------------- |
| 400       | 입력 유효성 오류 (BR-04 날짜, 비밀번호 조건 등)       |
| 401       | 인증 토큰 없음 또는 만료                              |
| 403       | 권한 없음 (타인 데이터 접근, 기본 카테고리 수정 시도) |
| 404       | 리소스 없음                                           |
| 409       | 중복 충돌 (이메일 중복 BR-09)                         |
| 500       | 서버 내부 오류                                        |

- 전역 에러 핸들링 미들웨어(`error.middleware.js`)에서 모든 에러를 통일된 형식으로 응답한다.
- 500 응답에는 스택 트레이스를 절대 포함하지 않는다.

> **Why:** 일관된 에러 응답 형식은 프론트엔드에서 에러 처리 로직을 단순화하고, 보안 민감 정보가 클라이언트에 노출되는 것을 방지한다.

### 5-7. 로깅 원칙

- 운영 환경에서는 민감 정보(비밀번호, 토큰)를 로그에 기록하지 않는다.
- 요청 로그에는 메서드, 경로, 응답 시간, 상태 코드를 포함한다.
- 에러 로그에는 에러 타입, 메시지, 스택 트레이스를 포함한다.
- 로그 레벨: `error`, `warn`, `info`, `debug` 순으로 운영은 `info` 이상만 출력한다.

> **Why:** 로그는 디버깅과 모니터링의 핵심 수단이다. 민감 정보 노출 없이 문제를 추적할 수 있어야 한다.

---

## 6. 프론트엔드 디렉토리 구조

React 19 + TypeScript + Zustand + TanStack Query 기반 구조다.

```
frontend/
├── public/
├── src/
│   ├── assets/              # 정적 파일 (이미지, 아이콘)
│   │
│   ├── components/          # 공통 재사용 컴포넌트 (도메인 무관)
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   └── ConfirmDialog.tsx
│   │
│   ├── features/            # 도메인별 기능 모듈
│   │   ├── auth/            # 인증 (회원가입, 로그인, 탈퇴)
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── todo/            # 할일 CRUD, 상태 관리, 필터
│   │   │   ├── components/
│   │   │   │   ├── TodoCard.tsx
│   │   │   │   ├── TodoList.tsx
│   │   │   │   ├── TodoForm.tsx
│   │   │   │   └── TodoFilter.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useTodoList.ts
│   │   │   │   └── useTodoForm.ts
│   │   │   └── __tests__/
│   │   │
│   │   └── category/        # 카테고리 CRUD
│   │       ├── components/
│   │       │   ├── CategoryList.tsx
│   │       │   └── CategoryForm.tsx
│   │       ├── hooks/
│   │       │   └── useCategoryList.ts
│   │       └── __tests__/
│   │
│   ├── hooks/               # features에 속하지 않는 공통 커스텀 훅
│   │   └── useDebounce.ts
│   │
│   ├── pages/               # 라우팅 단위 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── TodoListPage.tsx
│   │   ├── CategoryPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── stores/              # Zustand 전역 클라이언트 상태
│   │   ├── authStore.ts     # 인증 토큰, 로그인 사용자 정보
│   │   └── uiStore.ts       # 테마, 언어 (v2)
│   │
│   ├── api/                 # TanStack Query queryFn + axios/fetch 클라이언트
│   │   ├── client.ts        # 공통 fetch/axios 인스턴스 (인터셉터 포함)
│   │   ├── authApi.ts
│   │   ├── todoApi.ts
│   │   └── categoryApi.ts
│   │
│   ├── types/               # TypeScript 타입 정의
│   │   ├── user.ts          # User, UserUpdateRequest
│   │   ├── todo.ts          # Todo, CreateTodoRequest, TodoStatus
│   │   └── category.ts      # Category, CreateCategoryRequest
│   │
│   ├── utils/               # 순수 유틸리티 함수
│   │   ├── dateUtils.ts     # 날짜 포맷, endDate >= startDate 검증
│   │   └── validationUtils.ts # 이메일, 비밀번호 검증
│   │
│   ├── i18n/                # 다국어 리소스 (v2)
│   │   ├── ko.json
│   │   └── en.json
│   │
│   ├── styles/              # 전역 스타일, CSS 변수 (테마 — v2)
│   │   ├── global.css
│   │   └── theme.css        # light/dark 테마 CSS 변수
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### features/ 내부 구조 설명

각 도메인 피처는 `components/`, `hooks/`, `__tests__/` 3개 디렉토리를 기본 단위로 한다.

| 디렉토리             | 역할                                                |
| -------------------- | --------------------------------------------------- |
| `features/auth/`     | 로그인, 회원가입, 내 정보 수정, 탈퇴 관련 UI와 로직 |
| `features/todo/`     | 할일 목록, 등록/수정 폼, 필터, 상태 전이 UI 로직    |
| `features/category/` | 카테고리 목록, 생성/수정/삭제 UI 로직               |

`pages/`는 피처 컴포넌트들을 조합하는 역할만 담당하며 자체 비즈니스 로직을 포함하지 않는다.

> **Why:** 기능 단위로 디렉토리를 묶으면(Feature Sliced 방식) 할일 기능을 추가하거나 삭제할 때 변경 파일이 `features/todo/` 한 곳에 모인다.

---

## 7. 백엔드 디렉토리 구조

Node.js + JavaScript + Express + pg 기반 구조다.

```
backend/
├── src/
│   ├── routes/              # Express 라우터 — URL 매핑과 미들웨어 체이닝
│   │   ├── index.js         # 전체 라우터 등록 (app.use 진입점)
│   │   ├── auth.router.js
│   │   ├── user.router.js
│   │   ├── todo.router.js
│   │   └── category.router.js
│   │
│   ├── controllers/         # 요청/응답 처리 — req 파싱, res 반환만 담당
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── todo.controller.js
│   │   └── category.controller.js
│   │
│   ├── services/            # 비즈니스 로직 — 도메인 규칙(BR) 집행 위치
│   │   ├── auth.service.js  # 회원가입, 로그인, 토큰 발급
│   │   ├── user.service.js  # 내 정보 수정, 탈퇴 (BR-06, BR-08)
│   │   ├── todo.service.js  # CRUD, 날짜 검증(BR-04), 상태 전이(BR-05)
│   │   └── category.service.js  # CRUD, 기본 카테고리 보호(BR-07)
│   │
│   ├── repositories/        # DB 접근 — pg 라이브러리 직접 사용, SQL 쿼리만 포함
│   │   ├── user.repository.js
│   │   ├── todo.repository.js
│   │   └── category.repository.js
│   │
│   ├── middleware/          # Express 미들웨어
│   │   ├── auth.middleware.js    # JWT 검증 (BR-01 인증 필수)
│   │   ├── error.middleware.js   # 전역 에러 핸들러
│   │   └── logger.middleware.js  # 요청 로깅
│   │
│   ├── validators/          # 입력 유효성 검사 (컨트롤러 호출 전 실행)
│   │   ├── auth.validator.js     # 이메일 형식, 비밀번호 조건
│   │   ├── todo.validator.js     # 제목 필수, 날짜 형식
│   │   └── category.validator.js # 이름 필수
│   │
│   ├── config/              # 설정 모듈
│   │   ├── db.js            # pg Pool 설정 (커넥션 풀)
│   │   └── app.js           # Express 앱 설정 (CORS, bodyParser 등)
│   │
│   └── utils/               # 유틸리티
│       ├── jwt.js           # 토큰 생성, 검증 래퍼
│       └── password.js      # bcrypt 해싱, 비교 래퍼
│
├── tests/
│   ├── unit/
│   │   ├── todo.service.test.js
│   │   ├── category.service.test.js
│   │   └── user.service.test.js
│   └── integration/
│       ├── auth.router.test.js
│       ├── todo.router.test.js
│       └── category.router.test.js
│
├── migrations/              # SQL 마이그레이션 파일 (버전 순서대로 관리)
│   ├── 001_create_users.sql
│   ├── 002_create_categories.sql
│   ├── 003_create_todos.sql
│   └── 004_add_user_theme_language.sql  # v2
│
├── .env
├── .env.example
└── package.json
```

### 각 디렉토리 역할 요약

| 디렉토리        | 역할                           | 도메인 규칙 집행 위치              |
| --------------- | ------------------------------ | ---------------------------------- |
| `routes/`       | URL → 미들웨어 → 컨트롤러 연결 | 없음                               |
| `controllers/`  | HTTP req/res 파싱·반환         | 없음                               |
| `services/`     | 비즈니스 로직                  | BR-04, BR-05, BR-07, BR-08, BR-09  |
| `repositories/` | SQL 실행, 결과 반환            | 없음                               |
| `middleware/`   | 인증, 에러, 로깅               | BR-01                              |
| `validators/`   | 입력 형식 검증                 | BR-04 (형식), 이메일/비밀번호 형식 |
| `config/`       | DB 풀, 앱 설정                 | 없음                               |
| `utils/`        | bcrypt, JWT 래퍼               | 없음                               |
| `migrations/`   | 스키마 버전 관리               | 없음                               |

### migrations/ 관리 원칙

- 파일명은 `순번_설명.sql` 형식으로 고정한다.
- 한번 커밋된 마이그레이션 파일은 수정하지 않고 새 파일을 추가한다.
- v2 User 테이블의 `theme`, `language` 컬럼은 별도 마이그레이션 파일로 추가한다.

> **Why:** pg 직접 사용 환경에서 마이그레이션 파일을 순번으로 관리하면 스키마 변경 이력이 명확해지고 롤백 시 어느 지점으로 돌아가야 하는지 파악하기 쉽다.
