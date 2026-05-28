# 데이터베이스 마이그레이션

## 마이그레이션 파일 목록

| 순서 | 파일명 | 설명 | 버전 |
|------|--------|------|------|
| 001 | `001_initial_schema.sql` | users, categories, todos 테이블 및 인덱스 생성 | v1 |
| 002 | `002_add_user_theme_language.sql` | users 테이블에 theme·language 컬럼 추가 | v2 |

## 적용 방법

### 전제 조건
- PostgreSQL 17 이상
- `todolist` 데이터베이스 생성 완료
- `todolist_user` 유저 생성 및 권한 부여 완료

### 순서대로 실행

```bash
# v1 초기 스키마 적용
psql -U todolist_user -d todolist -f 001_initial_schema.sql

# v2 theme·language 컬럼 추가 (v2 기능 개발 시 적용)
psql -U todolist_user -d todolist -f 002_add_user_theme_language.sql
```

### 주의 사항
- 반드시 번호 순서대로 적용할 것
- 각 파일은 멱등성을 보장하지 않으므로 중복 실행 금지
- 프로덕션 적용 전 개발 환경에서 검증 후 적용
