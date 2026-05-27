-- TodoList 앱 데이터베이스 스키마
-- 버전: v1.0
-- 작성일: 2026-05-27
-- 참조: docs/6-erd.md

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    theme       VARCHAR(10)  NOT NULL DEFAULT 'light',
    language    VARCHAR(10)  NOT NULL DEFAULT 'ko',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users            PRIMARY KEY (id),
    CONSTRAINT uq_users_email      UNIQUE (email),
    CONSTRAINT ck_users_theme      CHECK (theme IN ('light', 'dark')),
    CONSTRAINT ck_users_language   CHECK (language IN ('ko', 'en'))
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

CREATE TABLE categories (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL,
    name        VARCHAR(100) NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_categories        PRIMARY KEY (id),
    CONSTRAINT fk_categories_user   FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
);

-- ---------------------------------------------------------------------------
-- todos
-- ---------------------------------------------------------------------------

CREATE TABLE todos (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    title        VARCHAR(200) NOT NULL,
    description  TEXT,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'NOT_STARTED',
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_todos             PRIMARY KEY (id),
    CONSTRAINT fk_todos_user        FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_todos_category    FOREIGN KEY (category_id)
        REFERENCES categories (id),
    CONSTRAINT ck_todos_dates       CHECK (end_date >= start_date),       -- BR-04
    CONSTRAINT ck_todos_status      CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'DONE'))
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

-- 사용자별 카테고리 목록 조회 (UC-05~07)
CREATE INDEX idx_categories_user_id ON categories (user_id);

-- 사용자별 할일 목록 조회 + 상태 필터 (UC-09)
CREATE INDEX idx_todos_user_id        ON todos (user_id);
CREATE INDEX idx_todos_user_status    ON todos (user_id, status);

-- 카테고리별 할일 필터 (UC-09)
CREATE INDEX idx_todos_category_id    ON todos (category_id);

-- 기한 초과 미완료 필터: endDate < 오늘 AND status != DONE (UC-09 Overdue)
CREATE INDEX idx_todos_end_date       ON todos (end_date);
