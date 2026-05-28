-- Migration 002: users 테이블에 theme·language 컬럼 추가 (v2)
-- 설명: 다크/라이트 모드(UC-12), 다국어(UC-13) 지원을 위한 사용자 설정 컬럼 추가
-- 의존성: 001_initial_schema.sql 적용 완료 후 실행
-- 적용: psql -U todolist_user -d todolist -f 002_add_user_theme_language.sql

-- ---------------------------------------------------------------------------
-- users 테이블 — theme, language 컬럼 추가
-- ---------------------------------------------------------------------------

ALTER TABLE users
    ADD COLUMN theme    VARCHAR(10) NOT NULL DEFAULT 'light',
    ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT 'ko';

-- CHECK 제약 조건 추가
ALTER TABLE users
    ADD CONSTRAINT ck_users_theme    CHECK (theme IN ('light', 'dark')),
    ADD CONSTRAINT ck_users_language CHECK (language IN ('ko', 'en'));
