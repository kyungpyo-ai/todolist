# 달력 뷰 실행계획

## 백엔드

### BE-07 할일 월 범위 필터 추가

**작업 내용**
- `GET /api/todos` 쿼리 파라미터에 `month` (`YYYY-MM`) 추가
- `month` 지정 시 해당 월 1일~말일 사이에 `start_date`가 포함된 할일만 반환
- 기존 `categoryId`, `status`, `overdue` 필터와 AND 조건으로 결합
- `swagger.json` 업데이트

**완료 조건**
- [x] `GET /api/todos?month=2026-05` 요청 시 해당 월 할일만 반환
- [x] 기존 필터(`categoryId`, `status`, `overdue`)와 병행 동작 확인
- [x] `swagger.json` 파라미터 추가

---

## 프론트엔드

### FE-10 react-big-calendar 설치 및 라우트 추가

**작업 내용**
- `react-big-calendar`, `moment` 패키지 설치
- `/calendar` 라우트 추가 (PrivateRoute + Layout 적용)
- IconNav에 달력 아이콘 추가

**완료 조건**
- [x] `react-big-calendar`, `moment` 설치 완료
- [x] `/calendar` 라우트 등록 및 PrivateRoute 적용
- [x] IconNav에 달력 아이콘 추가 및 활성 경로 표시 동작

---

### FE-11 캘린더 API 훅 및 페이지 구현

**작업 내용**
- `todoApi.ts`에 `month` 파라미터 지원 추가
- `useCalendarTodos` TanStack Query 훅 작성 (월 변경 시 자동 재요청)
- `CalendarPage.tsx` 구현: react-big-calendar 월별 뷰, 이전/다음 월 이동

**완료 조건**
- [x] `todoApi.ts`에 `month` 파라미터 추가
- [x] `useCalendarTodos.ts` 훅 — 현재 월 기준 데이터 조회, 월 변경 시 재요청
- [x] `CalendarPage.tsx` — 월별 달력 렌더링, 이전/다음 월 이동 동작

---

### FE-12 할일 데이터 바인딩 및 상태별 색상

**작업 내용**
- 할일 데이터를 react-big-calendar 이벤트 형식으로 변환 (`start_date` 기준)
- 상태별 색상 매핑 (NOT_STARTED / IN_PROGRESS / DONE)
- 다크/라이트 모드 테마 적용

**완료 조건**
- [x] 달력 각 날짜 셀에 할일 항목이 표시됨
- [x] 상태별 색상이 다르게 표시됨
- [x] 다크/라이트 모드 모두 정상 표시

---

### FE-13 할일 상세 모달

**작업 내용**
- `TodoDetailModal.tsx` 컴포넌트 구현: 제목, 설명, 날짜, 카테고리, 상태 표시
- 달력 이벤트 클릭 시 모달 오픈/클로즈 연결

**완료 조건**
- [x] 달력 항목 클릭 시 상세 모달이 열림
- [x] 모달에 제목, 설명, 날짜, 카테고리, 상태가 표시됨
- [x] 모달 닫기 동작

---

## 의존성

```
BE-07 (병렬 진행 가능)

FE-10 → FE-11 → FE-12 → FE-13

FE-11은 BE-07 완료 후 진행
```
