-- Migration 001: 초기 스키마 (v1)
-- 설명: users, categories, todos 테이블 및 인덱스 생성
-- 적용: psql -U todolist_user -d todolist -f 001_initial_schema.sql

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id          UUID         NOT NULL DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_users          PRIMARY KEY (id),
    CONSTRAINT uq_users_email    UNIQUE (email)
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

    CONSTRAINT pk_categories      PRIMARY KEY (id),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
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

    CONSTRAINT pk_todos          PRIMARY KEY (id),
    CONSTRAINT fk_todos_user     FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_todos_category FOREIGN KEY (category_id)
        REFERENCES categories (id),
    CONSTRAINT ck_todos_dates    CHECK (end_date >= start_date),
    CONSTRAINT ck_todos_status   CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'DONE'))
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_categories_user_id ON categories (user_id);
CREATE INDEX idx_todos_user_id      ON todos (user_id);
CREATE INDEX idx_todos_user_status  ON todos (user_id, status);
CREATE INDEX idx_todos_category_id  ON todos (category_id);
CREATE INDEX idx_todos_end_date     ON todos (end_date);
