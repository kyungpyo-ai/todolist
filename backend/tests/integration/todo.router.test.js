'use strict';

const request = require('supertest');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const app = require('../../src/config/app');
const { pool } = require('../../src/config/db');
const { sign } = require('../../src/utils/jwt');

const TEST_EMAIL_DOMAIN = '@test-be06.example';
const TEST_EMAIL = `todo-test${TEST_EMAIL_DOMAIN}`;
const VALID_NAME = '할일테스터';

let token;
let createdTodoId;

beforeAll(async () => {
  // 테스트 유저 생성
  await pool.query(
    `INSERT INTO users (email, password, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [TEST_EMAIL, '$2b$10$hashedpassword', VALID_NAME]
  );

  const userResult = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [TEST_EMAIL]
  );
  const userId = userResult.rows[0].id;

  // 기본 카테고리 생성
  await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [userId, '기본', true]
  );

  // JWT 발급
  token = sign(userId);
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '%${TEST_EMAIL_DOMAIN}'`);
  await pool.end();
});

describe('POST /api/todos', () => {
  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({
        title: '테스트 할일',
        startDate: '2026-06-01',
        endDate: '2026-06-05',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('endDate < startDate이면 400 INVALID_DATE_RANGE를 반환한다 (BR-04)', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '날짜 오류 할일',
        startDate: '2026-06-10',
        endDate: '2026-06-01',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_DATE_RANGE');
  });

  it('정상 요청 시 201과 생성된 todo를 반환한다', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '통합테스트할일',
        startDate: '2026-06-01',
        endDate: '2026-06-05',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('todo');
    expect(res.body.data.todo).toHaveProperty('id');
    expect(res.body.data.todo.title).toBe('통합테스트할일');
    expect(res.body.data.todo.status).toBe('NOT_STARTED');

    createdTodoId = res.body.data.todo.id;
  });
});

describe('GET /api/todos', () => {
  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).get('/api/todos');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('정상 요청 시 200과 todos 배열을 반환한다', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('todos');
    expect(Array.isArray(res.body.data.todos)).toBe(true);
  });
});

describe('PATCH /api/todos/:id', () => {
  it('NOT_STARTED → DONE 상태 전이 시도 시 400을 반환한다 (BR-05)', async () => {
    // createdTodoId가 앞선 POST 테스트에서 설정되어야 함
    if (!createdTodoId) {
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '상태전이테스트',
          startDate: '2026-06-01',
          endDate: '2026-06-05',
        });
      createdTodoId = createRes.body.data.todo.id;
    }

    const res = await request(app)
      .patch(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_STATUS_TRANSITION');
  });

  it('NOT_STARTED → IN_PROGRESS 상태 전이 시 200을 반환한다 (BR-05)', async () => {
    if (!createdTodoId) {
      const createRes = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: '상태전이테스트2',
          startDate: '2026-06-01',
          endDate: '2026-06-05',
        });
      createdTodoId = createRes.body.data.todo.id;
    }

    const res = await request(app)
      .patch(`/api/todos/${createdTodoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.todo.status).toBe('IN_PROGRESS');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('정상 삭제 시 200을 반환한다', async () => {
    // 삭제용 todo를 별도로 생성
    const createRes = await request(app)
      .post('/api/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '삭제테스트할일',
        startDate: '2026-06-01',
        endDate: '2026-06-03',
      });
    const todoToDeleteId = createRes.body.data.todo.id;

    const res = await request(app)
      .delete(`/api/todos/${todoToDeleteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/todos - month 필터', () => {
  const MONTH_TEST_EMAIL_DOMAIN = '@test-be07.example';
  const MONTH_TEST_EMAIL = `todo-month-test${MONTH_TEST_EMAIL_DOMAIN}`;
  let monthToken;

  beforeAll(async () => {
    // BE-07 전용 테스트 유저 생성
    await pool.query(
      `INSERT INTO users (email, password, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [MONTH_TEST_EMAIL, '$2b$10$hashedpassword', 'month필터테스터']
    );

    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [MONTH_TEST_EMAIL]
    );
    const userId = userResult.rows[0].id;

    // 기본 카테고리 생성
    await pool.query(
      `INSERT INTO categories (user_id, name, is_default)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [userId, '기본', true]
    );

    monthToken = sign(userId);

    // 테스트용 todo 데이터 삽입
    // 2026-05 월 내 할일
    await pool.query(
      `INSERT INTO todos (user_id, category_id, title, start_date, end_date, status)
       SELECT $1, c.id, $2, $3, $4, $5
       FROM categories c
       WHERE c.user_id = $1 AND c.is_default = true
       LIMIT 1`,
      [userId, '5월 할일', '2026-05-10', '2026-05-20', 'NOT_STARTED']
    );

    // 2026-05 월 내 할일 (IN_PROGRESS)
    await pool.query(
      `INSERT INTO todos (user_id, category_id, title, start_date, end_date, status)
       SELECT $1, c.id, $2, $3, $4, $5
       FROM categories c
       WHERE c.user_id = $1 AND c.is_default = true
       LIMIT 1`,
      [userId, '5월 진행중 할일', '2026-05-15', '2026-05-25', 'IN_PROGRESS']
    );

    // 2026-04 월 할일 (month 범위 밖)
    await pool.query(
      `INSERT INTO todos (user_id, category_id, title, start_date, end_date, status)
       SELECT $1, c.id, $2, $3, $4, $5
       FROM categories c
       WHERE c.user_id = $1 AND c.is_default = true
       LIMIT 1`,
      [userId, '4월 할일', '2026-04-10', '2026-04-30', 'NOT_STARTED']
    );

    // 2026-06 월 할일 (month 범위 밖)
    await pool.query(
      `INSERT INTO todos (user_id, category_id, title, start_date, end_date, status)
       SELECT $1, c.id, $2, $3, $4, $5
       FROM categories c
       WHERE c.user_id = $1 AND c.is_default = true
       LIMIT 1`,
      [userId, '6월 할일', '2026-06-01', '2026-06-10', 'NOT_STARTED']
    );
  });

  afterAll(async () => {
    await pool.query(`DELETE FROM users WHERE email LIKE '%${MONTH_TEST_EMAIL_DOMAIN}'`);
  });

  it('month=2026-05 요청 시 해당 월 할일만 반환한다', async () => {
    const res = await request(app)
      .get('/api/todos?month=2026-05')
      .set('Authorization', `Bearer ${monthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const todos = res.body.data.todos;
    expect(todos.length).toBe(2);
    todos.forEach((todo) => {
      expect(todo.startDate.startsWith('2026-05')).toBe(true);
    });
  });

  it('month 범위 밖 할일은 반환되지 않는다', async () => {
    const res = await request(app)
      .get('/api/todos?month=2026-05')
      .set('Authorization', `Bearer ${monthToken}`);

    expect(res.status).toBe(200);

    const todos = res.body.data.todos;
    const outOfRange = todos.filter(
      (todo) => !todo.startDate.startsWith('2026-05')
    );
    expect(outOfRange.length).toBe(0);
  });

  it('month + status 조합 필터가 정상 동작한다', async () => {
    const res = await request(app)
      .get('/api/todos?month=2026-05&status=IN_PROGRESS')
      .set('Authorization', `Bearer ${monthToken}`);

    expect(res.status).toBe(200);

    const todos = res.body.data.todos;
    expect(todos.length).toBe(1);
    expect(todos[0].title).toBe('5월 진행중 할일');
    expect(todos[0].status).toBe('IN_PROGRESS');
    expect(todos[0].startDate.startsWith('2026-05')).toBe(true);
  });

  it('잘못된 month 형식(2026-5) 요청 시 400을 반환한다', async () => {
    const res = await request(app)
      .get('/api/todos?month=2026-5')
      .set('Authorization', `Bearer ${monthToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('잘못된 month 형식(2026/05) 요청 시 400을 반환한다', async () => {
    const res = await request(app)
      .get('/api/todos?month=2026/05')
      .set('Authorization', `Bearer ${monthToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('month 없이 요청 시 전체 할일을 반환한다', async () => {
    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', `Bearer ${monthToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const todos = res.body.data.todos;
    // 4개 월 전체 데이터가 모두 반환됨
    expect(todos.length).toBe(4);
  });
});
