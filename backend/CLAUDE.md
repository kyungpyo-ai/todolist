# 백엔드 지침

## 기술 스택

| 라이브러리 | 용도 |
|-----------|------|
| Express | 웹 프레임워크 |
| pg | PostgreSQL 드라이버 (ORM 없음, 직접 SQL) |
| jsonwebtoken | JWT 발급·검증 |
| bcrypt | 비밀번호 해싱 |
| jest + supertest | 테스트 |

## 디렉토리 구조

```
src/
├── config/            # app.js (Express 설정), db.js (pg Pool)
├── controllers/       # 요청 파싱 → 서비스 호출 → 응답 반환
├── services/          # 비즈니스 로직, AppError throw
├── repositories/      # SQL 쿼리, DB 접근
├── routes/            # 라우터 정의
├── middleware/        # auth.middleware.js, error.middleware.js, logger.middleware.js
├── utils/             # jwt.js, password.js
└── validators/        # auth.validator.js, category.validator.js, todo.validator.js
```

## 아키텍처 규칙

- SOLID 원칙 준수
- Clean 아키텍처: routes → controllers → services → repositories
- ORM 사용 금지 — pg 라이브러리로 직접 SQL 작성

## 에러 처리

- 서비스에서 `AppError` throw → 컨트롤러 `next(err)` → error middleware가 처리
- `AppError`는 `src/middleware/error.middleware.js`에서 import
- 컨트롤러는 try/catch 없이 `next(err)` 패턴 사용

## API 응답 형식

- 성공: `{ success: true, data: { ... } }`
- 실패: `{ success: false, message: "...", code: "..." }` (error middleware 자동 처리)

## 인증

- `src/middleware/auth.middleware.js`: Authorization 헤더 검증, `req.user = { userId }` 주입
- 인증 필요 라우트에 미들웨어 적용

## 로깅

- 별도의 로깅 함수 정의 후 사용
- 콘솔 출력 (파일 시스템 X)

## 주요 비즈니스 규칙

| 규칙 | 내용 |
|------|------|
| BR-03 | 회원가입 시 `기본` 카테고리 자동 생성, 할일 카테고리 미지정 시 자동 적용 |
| BR-05 | 상태 전이: NOT_STARTED↔IN_PROGRESS, IN_PROGRESS↔DONE |
| BR-07 | `is_default=true` 카테고리 수정·삭제 → 403 반환 |
| BR-08 | 카테고리 삭제 시 하위 할일 → `기본` 카테고리로 일괄 이관 |

## User 테이블 v2 필드

| 필드 | 타입 | 기본값 | 허용값 |
|------|------|--------|--------|
| `theme` | VARCHAR(10) | `'light'` | `'light'`, `'dark'` |
| `language` | VARCHAR(10) | `'ko'` | `'ko'`, `'en'` |

- `PATCH /api/users/me` 에서 `theme`, `language` 수정 가능
- 응답 User 객체에 `theme`, `language` 항상 포함
- 허용되지 않는 값 입력 시 400 반환

## 테스트

```bash
npm test          # jest 전체 실행
```

- 단위 테스트: `jest.resetModules()` + `jest.doMock()` 패턴 (기존 테스트 파일 참고)
- 통합 테스트: 실제 DB 사용, `afterAll`에서 테스트 데이터 반드시 cleanup
- 테스트 파일 위치: `tests/unit/`, `tests/integration/`
