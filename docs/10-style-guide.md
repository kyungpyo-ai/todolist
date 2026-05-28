# 스타일 가이드 — TodoList 앱

| 항목 | 내용 |
|------|------|
| 버전 | 1.0 |
| 작성일 | 2026-05-28 |
| 참조 | 레퍼런스 UI 스크린샷 (금융결제원 웹메일 스타일) |

---

## 디자인 원칙

- **기능 우선**: 장식보다 정보 전달에 집중한다. 각 UI 요소는 역할이 명확해야 한다.
- **일관성**: 색상·여백·타이포그래피 규칙을 전 화면에 균일하게 적용한다.
- **밀도감 있는 레이아웃**: 최대한 많은 정보를 스크롤 없이 표시한다 (컴팩트 UI).
- **명확한 상태 표현**: 선택, 비활성, 오류, 경고, 완료 상태를 시각적으로 즉시 구별한다.

---

## 1. 색상 (Color)

### Primary Palette

| 토큰 | 값 | 용도 |
|------|----|------|
| `color-primary-900` | `#1a2b5e` | 헤더 배경, 사이드바 배경 |
| `color-primary-700` | `#1e3a8a` | 활성 네비게이션 아이템 |
| `color-primary-500` | `#2563eb` | 링크, 포커스 강조, 주요 액션 버튼 |
| `color-primary-100` | `#dbeafe` | 선택된 행 배경, hover 배경 |
| `color-primary-050` | `#eff6ff` | 패널 서브 배경 |

### Neutral Palette

| 토큰 | 값 | 용도 |
|------|----|------|
| `color-neutral-900` | `#111827` | 본문 주요 텍스트 |
| `color-neutral-700` | `#374151` | 본문 보조 텍스트 |
| `color-neutral-500` | `#6b7280` | 플레이스홀더, 메타 정보 |
| `color-neutral-300` | `#d1d5db` | 테두리, 구분선 |
| `color-neutral-100` | `#f3f4f6` | 테이블 날짜 그룹 헤더, 비활성 영역 배경 |
| `color-neutral-050` | `#f9fafb` | 페이지 기본 배경 |
| `color-white` | `#ffffff` | 컴포넌트 배경 |

### Semantic Palette

| 토큰 | 값 | 용도 |
|------|----|------|
| `color-danger-600` | `#dc2626` | 삭제 버튼, 오류 텍스트, 기한 초과 뱃지 |
| `color-danger-100` | `#fee2e2` | 오류 인라인 배경 |
| `color-warning-500` | `#f59e0b` | 경고 아이콘, 중요 표시 (★) |
| `color-warning-050` | `#fffbeb` | 공지사항 배너 배경 |
| `color-success-600` | `#16a34a` | 완료 상태 뱃지 |
| `color-success-100` | `#dcfce7` | 완료 상태 뱃지 배경 |

### 상태 뱃지 색상

| 상태 | 배경색 | 텍스트색 |
|------|--------|---------|
| `NOT_STARTED` (미시작) | `#f3f4f6` | `#374151` |
| `IN_PROGRESS` (진행중) | `#dbeafe` | `#1e3a8a` |
| `DONE` (완료) | `#dcfce7` | `#16a34a` |
| Overdue (기한 초과) | `#fee2e2` | `#dc2626` |

---

## 2. 타이포그래피 (Typography)

### 폰트 패밀리

```css
font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
```

### 크기 체계

| 토큰 | 크기 | line-height | 용도 |
|------|------|-------------|------|
| `text-xs` | 11px | 1.4 | 날짜, 파일크기, 메타 정보 |
| `text-sm` | 12px | 1.5 | 목록 본문, 버튼 레이블, 보조 설명 |
| `text-base` | 13px | 1.6 | 기본 본문, 입력값 |
| `text-md` | 14px | 1.6 | 섹션 레이블, 중간 강조 |
| `text-lg` | 16px | 1.5 | 페이지 타이틀 |
| `text-xl` | 18px | 1.4 | 모달 타이틀 |

### 굵기

| 토큰 | 값 | 용도 |
|------|----|------|
| `font-normal` | 400 | 기본 본문 |
| `font-medium` | 500 | 버튼, 레이블 강조 |
| `font-bold` | 700 | 페이지 타이틀, 중요 강조 |

---

## 3. 레이아웃 (Layout)

### 전체 레이아웃 구조

```
┌────────────────────────────────────────────────────────┐
│ Header (고정, height: 44px, background: primary-900)   │
├────────────────────────────────────────────────────────┤
│ Icon Nav │ Side Panel │ Main Content Area              │
│ (56px)   │ (220px)    │ (flex: 1)                      │
│ 데스크톱  │            │                               │
├────────────────────────────────────────────────────────┤
│ Status Bar (고정, height: 28px)                        │
└────────────────────────────────────────────────────────┘
```

### 브레이크포인트

| 구분 | 기준 너비 | 레이아웃 변화 |
|------|-----------|---------------|
| 모바일 | `< 768px` | Icon Nav + Side Panel 숨김, 하단 탭 바 표시 |
| 데스크톱 | `≥ 768px` | 3열 레이아웃, 하단 탭 바 숨김 |

### 여백 체계 (Spacing)

| 토큰 | 값 | 용도 |
|------|----|------|
| `space-1` | 4px | 아이콘 내부 패딩, 뱃지 수직 패딩 |
| `space-2` | 8px | 버튼 수직 패딩, 셀 내부 수직 패딩 |
| `space-3` | 12px | 버튼 수평 패딩, 폼 항목 간격 |
| `space-4` | 16px | 섹션 내부 패딩, 카드 패딩 |
| `space-6` | 24px | 섹션 간 여백 |
| `space-8` | 32px | 페이지 여백 (데스크톱) |

---

## 4. 컴포넌트 (Components)

### 4-1. 헤더 (Header)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [로고] TodoList         최근접속: 2026/05/28 08:56    홍길동 ▼  [로그아웃] │
└──────────────────────────────────────────────────────────────────────────┘
```

| 속성 | 값 |
|------|-----|
| 배경 | `color-primary-900` (#1a2b5e) |
| 텍스트 | `#ffffff` |
| 높이 | 44px |
| 로고 폰트 | `text-lg`, `font-bold` |
| 우측 사용자 정보 | `text-sm`, 이름 뒤 드롭다운 화살표 |
| 로그아웃 버튼 | 흰색 테두리 버튼, 패딩 `space-2 space-3` |

---

### 4-2. 아이콘 네비게이션 바 (Icon Navigation)

데스크톱 전용 좌측 세로 네비게이션.

| 속성 | 값 |
|------|-----|
| 너비 | 56px |
| 배경 | `color-primary-900` |
| 아이콘 크기 | 20px |
| 텍스트 | `text-xs`, 아이콘 하단 표시 |
| 비활성 | 흰색 아이콘 + 텍스트 (opacity 0.75) |
| 활성 | 흰색 아이콘 + 텍스트 (opacity 1.0) + 좌측 3px 파란 accent bar |

---

### 4-3. 사이드 패널 (Side Panel)

좌측 트리형 메뉴/폴더 구조.

| 속성 | 값 |
|------|-----|
| 너비 | 220px |
| 배경 | `color-white` |
| 우측 테두리 | 1px solid `color-neutral-300` |
| 항목 높이 | 30px |
| 항목 패딩 | `space-2 space-3` |
| 항목 폰트 | `text-sm`, `color-neutral-900` |
| 활성 항목 | 배경 `color-primary-100`, 텍스트 `color-primary-700`, `font-medium` |
| hover | 배경 `color-neutral-100` |
| 카운트 뱃지 | 우측 정렬, `color-primary-500` 텍스트, `text-xs` |

---

### 4-4. 툴바 (Toolbar)

목록 화면 상단 액션 버튼 영역.

```
[전체선택 ▼]  [✕ 삭제]  [✕ 완전삭제]  [읽음]  ...       [필터: 카테고리 ▼] [상태 ▼] [기한초과]
```

| 속성 | 값 |
|------|-----|
| 배경 | `color-white` |
| 하단 테두리 | 1px solid `color-neutral-300` |
| 높이 | 40px |
| 버튼 간격 | `space-1` |

**툴바 버튼 스타일:**

| 종류 | 배경 | 테두리 | 텍스트 | 예시 |
|------|------|--------|--------|------|
| 기본 | `color-white` | 1px `color-neutral-300` | `color-neutral-700` | 읽음, 전달 |
| 위험 | `color-white` | 1px `color-danger-600` | `color-danger-600` | ✕ 삭제 |
| 드롭다운 | `color-white` | 1px `color-neutral-300` | `color-neutral-700` | 전체선택 ▼ |
| 활성 필터 | `color-primary-100` | 1px `color-primary-500` | `color-primary-700` | 기한초과 (선택됨) |

버튼 공통 스타일:
```css
height: 28px;
padding: 0 10px;
font-size: 12px;
border-radius: 3px;
cursor: pointer;
```

---

### 4-5. 목록 테이블 (List Table)

할일 목록 표시 영역.

```
┌───────────────────────────────────────────────────────────────────────┐
│ ☐  ★  [카테고리]  제목                              상태     날짜      │  ← 헤더
├───────────────────────────────────────────────────────────────────────┤
│ ── 오늘 목요일 - 2026.05.28 ──────────────────────────────────────────│  ← 날짜 그룹
├───────────────────────────────────────────────────────────────────────┤
│ ☐  ★  [업무]  보고서 작성                          진행중   05-31      │
├───────────────────────────────────────────────────────────────────────┤
│ ☐  ☆  [기본]  알고리즘 기말 대비          [기한초과] 미시작   06-01      │
└───────────────────────────────────────────────────────────────────────┘
```

**헤더 행:**

| 속성 | 값 |
|------|-----|
| 배경 | `color-neutral-100` |
| 높이 | 32px |
| 폰트 | `text-sm`, `font-medium`, `color-neutral-700` |
| 테두리 | 하단 1px `color-neutral-300` |
| 정렬 컬럼 표시 | ▲▼ 아이콘 `text-xs` |

**날짜 그룹 헤더 행:**

| 속성 | 값 |
|------|-----|
| 배경 | `color-neutral-100` |
| 높이 | 28px |
| 폰트 | `text-sm`, `font-medium` |
| 날짜 텍스트 | `color-primary-500`, 클릭 시 그룹 접기/펼치기 |

**데이터 행:**

| 속성 | 값 |
|------|-----|
| 배경 | `color-white` |
| 높이 | 38px |
| 하단 테두리 | 1px `color-neutral-100` |
| hover 배경 | `color-primary-050` |
| 선택 배경 | `color-primary-100` |
| 폰트 | `text-sm`, `color-neutral-900` |

**컬럼 구성 (할일 목록):**

| 컬럼 | 너비 | 내용 |
|------|------|------|
| 체크박스 | 36px | 행 선택 |
| 중요 | 28px | ★ 즐겨찾기 |
| 카테고리 | 80px | 카테고리명 뱃지 |
| 제목 | flex | 할일 제목, 기한 초과 뱃지 |
| 상태 | 80px | 상태 뱃지 |
| 날짜 | 120px | `startDate ~ endDate` |
| 액션 | 80px | [수정] [삭제] |

---

### 4-6. 공지/안내 배너 (Notice Banner)

```
┌───────────────────────────────────────────────────────────────────────┐
│  공지사항  ⚠ 기한 초과 할일이 3건 있습니다.                오늘 그만 보기 X │
└───────────────────────────────────────────────────────────────────────┘
```

| 속성 | 값 |
|------|-----|
| 배경 | `color-warning-050` (#fffbeb) |
| 테두리 | 1px `#fcd34d` |
| 높이 | 34px |
| 패딩 | `space-2 space-4` |
| 레이블 | `color-warning-500`, `font-bold`, `text-sm` |
| 본문 | `color-neutral-900`, `text-sm` |

---

### 4-7. 버튼 (Button)

#### Primary Button (주요 액션)

```css
background: #2563eb;
color: #ffffff;
border: none;
border-radius: 3px;
padding: 6px 14px;
font-size: 13px;
font-weight: 500;
```

hover: `background: #1d4ed8`
disabled: `opacity: 0.4; cursor: not-allowed`

#### Secondary Button (보조 액션)

```css
background: #ffffff;
color: #374151;
border: 1px solid #d1d5db;
border-radius: 3px;
padding: 6px 14px;
font-size: 13px;
```

hover: `background: #f9fafb`

#### Danger Button (삭제/위험)

```css
background: #ffffff;
color: #dc2626;
border: 1px solid #dc2626;
border-radius: 3px;
padding: 6px 14px;
font-size: 13px;
```

hover: `background: #fee2e2`

#### Ghost Button (툴바용)

```css
background: transparent;
color: #374151;
border: 1px solid #d1d5db;
border-radius: 3px;
padding: 4px 10px;
font-size: 12px;
height: 28px;
```

---

### 4-8. 뱃지 (Badge)

#### 카테고리 뱃지

```css
display: inline-block;
padding: 1px 7px;
border-radius: 2px;
font-size: 11px;
font-weight: 500;
background: #eff6ff;
color: #1e3a8a;
border: 1px solid #bfdbfe;
```

#### 상태 뱃지

| 상태 | 배경 | 텍스트 | 레이블 |
|------|------|--------|--------|
| NOT_STARTED | `#f3f4f6` | `#374151` | 미시작 |
| IN_PROGRESS | `#dbeafe` | `#1e3a8a` | 진행중 |
| DONE | `#dcfce7` | `#16a34a` | 완료 |
| Overdue | `#fee2e2` | `#dc2626` | 기한초과 |

공통 스타일:
```css
display: inline-block;
padding: 2px 8px;
border-radius: 10px;
font-size: 11px;
font-weight: 500;
```

#### 카운트 뱃지 (사이드 패널용)

```css
display: inline-block;
min-width: 18px;
height: 18px;
padding: 0 4px;
border-radius: 9px;
font-size: 11px;
font-weight: bold;
background: #2563eb;
color: #ffffff;
text-align: center;
line-height: 18px;
```

---

### 4-9. 입력 폼 (Form Input)

#### 텍스트 입력 (Input / Textarea)

```css
width: 100%;
padding: 6px 10px;
font-size: 13px;
color: #111827;
background: #ffffff;
border: 1px solid #d1d5db;
border-radius: 3px;
outline: none;
```

focus:
```css
border-color: #2563eb;
box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
```

error:
```css
border-color: #dc2626;
box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.10);
```

disabled:
```css
background: #f3f4f6;
color: #9ca3af;
cursor: not-allowed;
```

#### 셀렉트 박스 (Select)

```css
/* input 스타일 동일 */
appearance: none;
background-image: url("data:image/svg+xml,..."); /* ▼ 화살표 */
background-repeat: no-repeat;
background-position: right 8px center;
padding-right: 28px;
```

#### 인라인 오류 메시지

```css
display: block;
margin-top: 4px;
font-size: 11px;
color: #dc2626;
```

```
! 종료일은 시작일 이후여야 합니다
```

#### 폼 레이블

```css
display: block;
margin-bottom: 4px;
font-size: 12px;
font-weight: 500;
color: #374151;
```

필수 표시: 레이블 뒤 ` *` (color: #dc2626)

---

### 4-10. 모달 / 다이얼로그 (Modal)

```
┌───────────────────────────────────────────────────────────┐
│  할일 삭제                                             [X] │  ← 타이틀 바
├───────────────────────────────────────────────────────────┤
│                                                           │
│  "보고서 작성"을 삭제하시겠습니까?                          │
│  삭제한 할일은 복구할 수 없습니다.                          │
│                                                           │
├───────────────────────────────────────────────────────────┤
│                                   [취소]  [삭제]          │  ← 푸터
└───────────────────────────────────────────────────────────┘
```

| 속성 | 값 |
|------|-----|
| 오버레이 | `rgba(0, 0, 0, 0.4)` |
| 배경 | `color-white` |
| 테두리 | 1px `color-neutral-300` |
| border-radius | 4px |
| box-shadow | `0 4px 16px rgba(0,0,0,0.15)` |
| 최소 너비 | 360px |
| 최대 너비 | 560px |
| 타이틀 바 | 배경 `color-primary-900`, 텍스트 흰색, 높이 40px, `font-medium`, `text-md` |
| 본문 패딩 | `space-6` |
| 푸터 | 배경 `color-neutral-050`, 패딩 `space-3 space-4`, 우측 정렬 버튼 |

---

### 4-11. 페이지네이션 (Pagination)

```
[◀◀]  [◀]  1  2  3  4  5  6  7  8  9  10  [▶]  [▶▶]
```

| 속성 | 값 |
|------|-----|
| 버튼 크기 | 26px × 26px |
| 배경 | `color-white` |
| 테두리 | 1px `color-neutral-300` |
| border-radius | 2px |
| 폰트 | `text-sm` |
| 현재 페이지 | 배경 `color-primary-500`, 텍스트 흰색, `font-bold` |
| hover | 배경 `color-primary-100` |

---

### 4-12. 체크박스 (Checkbox)

```css
width: 14px;
height: 14px;
accent-color: #2563eb;
cursor: pointer;
```

---

### 4-13. 즐겨찾기 아이콘 (Star)

| 상태 | 색상 |
|------|------|
| 비활성 (☆) | `#d1d5db` |
| 활성 (★) | `#f59e0b` |

---

### 4-14. 상태바 / 하단 바 (Status Bar)

```
┌────────────────────────────────────────────────────────────────────┐
│  전체 할일: 24건  │  진행중: 5건  │ ████████░░ 2.4GB / 3GB         │
└────────────────────────────────────────────────────────────────────┘
```

| 속성 | 값 |
|------|-----|
| 배경 | `color-neutral-100` |
| 상단 테두리 | 1px `color-neutral-300` |
| 높이 | 28px |
| 패딩 | `space-2 space-4` |
| 폰트 | `text-xs`, `color-neutral-700` |

---

### 4-15. 진행바 (Progress Bar)

```css
/* 컨테이너 */
height: 10px;
background: #e5e7eb;
border-radius: 5px;
overflow: hidden;

/* 채움 */
height: 100%;
background: #2563eb;
border-radius: 5px;
```

---

## 5. 아이콘 (Icons)

- **라이브러리**: [Heroicons](https://heroicons.com/) (outline 스타일 기본, solid는 활성 상태에만 사용)
- **크기**: 14px (툴바·테이블 내), 18px (사이드바), 20px (아이콘 네비)
- **색상**: 부모 텍스트 색상 상속 (`currentColor`)

| 용도 | 아이콘 |
|------|--------|
| 할일 | `clipboard-list` |
| 카테고리 | `tag` |
| 내 정보 | `user` |
| 로그아웃 | `arrow-right-on-rectangle` |
| 새 항목 추가 | `plus` |
| 수정 | `pencil` |
| 삭제 | `trash` |
| 닫기 | `x-mark` |
| 검색 | `magnifying-glass` |
| 즐겨찾기 | `star` |
| 경고 | `exclamation-triangle` |
| 체크 | `check` |
| 화살표 (드롭다운) | `chevron-down` |
| 테마 토글 [v2] | `moon` / `sun` |

---

## 6. 인터랙션 (Interaction)

### Transition

```css
transition: background-color 0.1s ease, border-color 0.1s ease, opacity 0.1s ease;
```

리스트 행 hover, 버튼 상태 변화에 적용. 과도한 애니메이션은 사용하지 않는다.

### Focus Ring

```css
outline: 2px solid #2563eb;
outline-offset: 2px;
```

키보드 접근성을 위해 모든 인터랙티브 요소에 포커스 링을 유지한다.

### Loading State

목록 로딩 중에는 행 영역에 Skeleton UI를 표시한다.

```css
/* Skeleton */
background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
background-size: 200% 100%;
animation: skeleton-loading 1.2s ease-in-out infinite;
border-radius: 3px;
```

---

## 7. 반응형 (Responsive)

### 데스크톱 (≥ 768px)

- 아이콘 네비 (56px) + 사이드 패널 (220px) + 메인 컨텐츠 (나머지)
- 헤더: 풀 너비, 좌측 로고 + 우측 사용자 정보
- 할일 목록: 테이블 형태, 모든 컬럼 표시
- 상태바: 표시

### 모바일 (< 768px)

- 아이콘 네비, 사이드 패널: 숨김
- 헤더: 앱 타이틀 + 우측 테마 토글[v2] + 더보기 메뉴 아이콘
- 할일 목록: 카드 형태 (날짜/카테고리/상태를 카드 내부 배치)
- 할일 등록 버튼: 우하단 FAB (Floating Action Button, 56px 원형)
- 하단 탭 바: 높이 56px, 배경 흰색, 상단 테두리 1px
- 상태바: 숨김

**모바일 할일 카드:**

```
┌──────────────────────────────────────────┐
│ [업무]  보고서 작성              [진행중]  │
│ 2026-05-28 ~ 2026-05-31                  │
│ 분기별 성과 보고서 초안...                 │
│                            [수정] [삭제]  │
└──────────────────────────────────────────┘
```

```css
/* 카드 */
background: #ffffff;
border: 1px solid #e5e7eb;
border-radius: 6px;
padding: 12px 14px;
margin-bottom: 8px;
```

---

## 8. CSS 변수 (Custom Properties)

`src/styles/variables.css` 에 정의하여 전체에서 공유한다.

```css
:root {
  /* Primary */
  --color-primary-900: #1a2b5e;
  --color-primary-700: #1e3a8a;
  --color-primary-500: #2563eb;
  --color-primary-100: #dbeafe;
  --color-primary-050: #eff6ff;

  /* Neutral */
  --color-neutral-900: #111827;
  --color-neutral-700: #374151;
  --color-neutral-500: #6b7280;
  --color-neutral-300: #d1d5db;
  --color-neutral-100: #f3f4f6;
  --color-neutral-050: #f9fafb;
  --color-white: #ffffff;

  /* Semantic */
  --color-danger-600: #dc2626;
  --color-danger-100: #fee2e2;
  --color-warning-500: #f59e0b;
  --color-warning-050: #fffbeb;
  --color-success-600: #16a34a;
  --color-success-100: #dcfce7;

  /* Layout */
  --header-height: 44px;
  --icon-nav-width: 56px;
  --side-panel-width: 220px;
  --status-bar-height: 28px;
  --toolbar-height: 40px;

  /* Border Radius */
  --radius-sm: 2px;
  --radius-md: 3px;
  --radius-lg: 6px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-modal: 0 4px 16px rgba(0, 0, 0, 0.15);

  /* Font */
  --font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  --font-xs: 11px;
  --font-sm: 12px;
  --font-base: 13px;
  --font-md: 14px;
  --font-lg: 16px;
  --font-xl: 18px;

  /* Transition */
  --transition-fast: 0.1s ease;
}
```

---

## 9. Do / Don't

### Do

- 버튼 레이블은 동사형으로 (저장, 삭제, 생성, 취소)
- 테이블 내 모든 행은 hover 배경색 변화 제공
- 기본 카테고리(`isDefault: true`)는 수정/삭제 버튼 비활성화로 명시적으로 표시
- 삭제/탈퇴 등 비가역적 액션은 반드시 확인 다이얼로그 표시
- 오류 메시지는 필드 바로 아래 인라인으로 표시
- 상태 뱃지에 색상과 텍스트를 모두 사용 (색맹 대응)

### Don't

- 경고/오류 상황에 toast만 사용하고 인라인 피드백 생략하지 않기
- 버튼을 여러 스타일로 혼용하지 않기 (화면당 Primary 버튼 최대 1개)
- 컬러만으로 상태를 표현하지 않기 (뱃지 텍스트 병행 필수)
- 12px 미만 폰트는 사용하지 않기 (가독성)
- box-shadow에 의존한 과도한 입체감 적용 금지 (플랫 디자인 유지)
