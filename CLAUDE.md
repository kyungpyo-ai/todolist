# TodoList 앱 — 공통 지침

## 규칙

- 오버엔지니어링 금지 — 지시한 작업 외에는 절대 수행하지 말 것
- 모든 대화, 커뮤니케이션은 반드시 한국어로 진행할 것

---

## 프로젝트 개요

JWT 기반 인증을 사용하는 개인 할일 관리 웹 앱.
카테고리 분류, 상태 관리, 다크/라이트 모드, 다국어(한/영) 지원.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript, Vite, Zustand, TanStack Query, React Router v7 |
| 백엔드 | Node.js, Express, JavaScript |
| 데이터베이스 | PostgreSQL 17 (pg 라이브러리 직접 사용, ORM 없음) |
| 인증 | JWT (jsonwebtoken, bcrypt) |
| 다국어 | i18next + react-i18next |

## 디렉토리 구조

```
todolist/
├── frontend/          # React 앱 (포트 5173)
├── backend/           # Express API 서버 (포트 3000)
├── database/          # DDL, 마이그레이션 SQL
└── docs/              # PRD, 실행계획, 스타일가이드, 와이어프레임 등
```

## 서버 실행

서버는 항상 사용자가 직접 실행한다. **Claude는 서버를 구동하지 않는다.**
- 백엔드: 포트 3000 (`node src/server.js`)
- 프론트엔드: 포트 5173 (`npm run dev`)

서버 동작 확인이 필요할 때는 HTTP 요청으로만 확인한다.

## 핵심 문서 위치

| 문서 | 경로 |
|------|------|
| PRD | `docs/2-PRD.md` |
| 실행 계획 | `docs/7-execution-plan.md` |
| 스타일 가이드 | `docs/10-style-guide.md` |
| 와이어프레임 | `docs/8-wireframe.md` |
| 도메인 정의 | `docs/1-domain-definition.md` |
| 설계 원칙 | `docs/4-project-structure-principles.md` |
| API 명세 | `backend/swagger.json` |

## 기능 추가 시 문서 관리

### 개발 중 (임시 문서 — `docs/features/`)

기능 하나당 2개 파일 생성:

```
docs/features/
├── {feature-name}.md        # 요구사항 (무엇을)
└── {feature-name}-plan.md   # 실행계획 (어떤 순서로)
```

요구사항 문서 섹션: 목적 / 요구사항 / UI·UX / 신규 API / 완료 조건 체크리스트
실행계획 문서 섹션: 백엔드 (BE-XX) / 프론트엔드 (FE-XX) / 의존성

### 기능 완료 후 처리

완료 조건 체크리스트 전부 ✅ 시 즉시 처리

| 문서 | 처리 방법 |
|------|-----------|
| `{feature-name}.md` | 아래 병합 기준에 따라 병합 후 삭제 |
| `{feature-name}-plan.md` | `docs/archive/` 로 이동 |

### 병합 기준

| 내용 | 병합 위치 |
|------|-----------|
| 새 비즈니스 규칙 (BR-XX) | `docs/1-domain-definition.md` |
| 새 기능 요구사항, 시나리오 | `docs/2-PRD.md` |
| DB 스키마 변경 | `docs/6-erd.md` |
| 새 API 엔드포인트 | `backend/swagger.json` |
| 모듈/서비스 구조 변경 | `docs/5-arch-diagram.md` |

### 항상 최신 상태 유지 문서

- `docs/1-domain-definition.md` — 도메인 규칙
- `docs/2-PRD.md` — 기능 요구사항
- `docs/5-arch-diagram.md` — 아키텍처
- `docs/6-erd.md` — ERD
- `docs/10-style-guide.md` — 스타일 규칙
- `backend/swagger.json` — API 명세

---

## 도메인 규칙 요약

| 규칙 | 내용 |
|------|------|
| BR-03 | 할일 카테고리 미지정 시 `기본` 카테고리 자동 적용 |
| BR-04 | `end_date >= start_date` 검증 (프론트/백엔드 모두) |
| BR-05 | 상태 전이: NOT_STARTED↔IN_PROGRESS, IN_PROGRESS↔DONE |
| BR-07 | `is_default=true` 카테고리 수정·삭제 금지 (403 반환) |
| BR-08 | 회원 탈퇴 시 categories·todos CASCADE 삭제 |
| BR-09 | 이메일 중복 가입 불가 (409 반환) |
