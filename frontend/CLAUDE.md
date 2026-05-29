# 프론트엔드 지침

## 기술 스택

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| React + TypeScript | 19 | UI |
| Vite | 8 | 빌드 도구 |
| React Router | v7 | 라우팅 |
| TanStack Query | v5 | 서버 상태 관리 |
| Zustand | v5 (persist) | 클라이언트 상태 |
| Axios | - | HTTP 클라이언트 |
| i18next + react-i18next | - | 다국어 |
| Vitest + @testing-library/react | - | 테스트 |

## 디렉토리 구조

```
src/
├── api/               # API 함수 (authApi, userApi, categoryApi, todoApi, client)
├── components/        # 공통 컴포넌트 (Header, IconNav, Layout, ConfirmDialog)
├── features/          # 기능별 컴포넌트·훅
│   ├── auth/          # LoginForm, SignupForm, useAuth
│   ├── category/      # CategoryList, CategoryForm, useCategoryList
│   ├── todo/          # TodoCard, TodoList, TodoFilter, TodoForm, useTodoList, useTodoForm
│   └── profile/       # useProfile
├── i18n/              # ko.json, en.json, index.ts (i18next 설정)
├── pages/             # 페이지 컴포넌트 (LoginPage, SignupPage, TodoListPage, CategoryPage, ProfilePage)
├── stores/            # authStore (JWT+User), uiStore (theme+language)
├── styles/            # variables.css (색상·폰트 변수), theme.css (다크 테마 재정의)
├── types/             # user.ts, todo.ts, category.ts
└── utils/             # dateUtils, validationUtils
```

## 핵심 패턴

### API 클라이언트 (`src/api/client.ts`)
- baseURL: `VITE_API_BASE_URL` 환경 변수
- 요청 인터셉터: authStore에서 token 읽어 `Authorization: Bearer` 자동 주입
- 응답 인터셉터: 401 수신 시 `clearAuth()` + `/login` 리다이렉트

### 인증 상태 (`src/stores/authStore.ts`)
- `token`, `user` — localStorage persist (`auth-storage` 키)
- `setAuth(token, user)`, `clearAuth()`, `isAuthenticated()`
- 로그인 성공 시 서버 응답의 `user.theme`, `user.language` → uiStore에도 동기화

### UI 상태 (`src/stores/uiStore.ts`)
- `theme: 'light' | 'dark'`, `language: 'ko' | 'en'`
- localStorage persist (`ui-storage` 키)
- 테마 변경 시 `document.documentElement.setAttribute('data-theme', ...)` 반드시 함께 호출

### 서버 상태 (TanStack Query)
- queryKey 규칙: `['todos']`, `['categories']`, `['me']`
- mutation 성공 시 `queryClient.invalidateQueries({ queryKey: [...] })`로 갱신

### 레이아웃
- 인증 필요 페이지: `<Layout>` 으로 감쌈 (인증 가드 + Header + IconNav 포함)
- 비인증 페이지: `/login`, `/signup` (Layout 없음)

## 다크 모드

- `src/styles/variables.css`: light 기본값 CSS 변수 (`--color-*`)
- `src/styles/theme.css`: `[data-theme="dark"]` 블록에서 동일 `--color-*` 변수 재정의
- 기존 컴포넌트 CSS는 `var(--color-*)` 그대로 사용 — 변수 재정의만으로 전체 테마 전환됨
- 앱 로드 시 `main.tsx`에서 uiStore 값으로 `data-theme` 즉시 적용

## 다국어 (i18next)

- `src/i18n/index.ts`: uiStore의 저장된 언어로 초기화
- 번역 키 네임스페이스: `common`, `auth`, `nav`, `todo`, `category`, `profile`
- 컴포넌트에서: `const { t } = useTranslation();`
- 언어 변경 시: `i18n.changeLanguage(lang)` + `uiStore.setLanguage(lang)` + 서버 저장 (fire-and-forget)

## 테스트

```bash
npm test          # 전체 실행 (160개)
npm run test:watch
```

- `src/test/setup.ts`: @testing-library/jest-dom 설정 + i18next 한국어 고정 초기화
- API mock: `vi.mock('../../../api/...')` 패턴
- store mock: `vi.mock('../../../stores/authStore')` 패턴
- User 목 객체에는 `theme: 'light'`, `language: 'ko'` 필드 반드시 포함

## CSS 변수 주요 토큰

전체 목록: `src/styles/variables.css` 참고.
색상은 `var(--color-primary-*)`, `var(--color-neutral-*)` 형태로 사용.
직접 hex 값 하드코딩 금지.
