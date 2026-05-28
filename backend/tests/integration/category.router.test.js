'use strict';

const request = require('supertest');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const app = require('../../src/config/app');
const { pool } = require('../../src/config/db');
const { sign } = require('../../src/utils/jwt');

const TEST_EMAIL_DOMAIN = '@test-be05.example';
const TEST_EMAIL = `category-test${TEST_EMAIL_DOMAIN}`;
const VALID_PASSWORD = 'Password1';
const VALID_NAME = '카테고리테스터';

let token;
let defaultCategoryId;
let testCategoryId;

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
  const catResult = await pool.query(
    `INSERT INTO categories (user_id, name, is_default)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [userId, '기본', true]
  );
  defaultCategoryId = catResult.rows[0].id;

  // JWT 발급
  token = sign(userId);
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '%${TEST_EMAIL_DOMAIN}'`);
  await pool.end();
});

describe('GET /api/categories', () => {
  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('정상 요청 시 200과 categories 배열을 반환한다', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('categories');
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });
});

describe('POST /api/categories', () => {
  it('인증 없이 요청 시 401을 반환한다', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: '테스트 카테고리' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('name이 없으면 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('정상 요청 시 201과 생성된 category를 반환한다', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '통합테스트카테고리' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('category');
    expect(res.body.data.category).toHaveProperty('id');
    expect(res.body.data.category.name).toBe('통합테스트카테고리');
    expect(res.body.data.category.isDefault).toBe(false);

    testCategoryId = res.body.data.category.id;
  });
});

describe('PATCH /api/categories/:id', () => {
  it('기본 카테고리 수정 시도 시 403을 반환한다', async () => {
    const res = await request(app)
      .patch(`/api/categories/${defaultCategoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '수정된이름' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('DEFAULT_CATEGORY_PROTECTED');
  });

  it('정상 수정 시 200과 업데이트된 category를 반환한다', async () => {
    // testCategoryId가 앞선 POST 테스트에서 설정되어야 함
    // 없으면 별도로 생성
    if (!testCategoryId) {
      const createRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '수정용카테고리' });
      testCategoryId = createRes.body.data.category.id;
    }

    const res = await request(app)
      .patch(`/api/categories/${testCategoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '수정완료' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('category');
    expect(res.body.data.category.name).toBe('수정완료');
  });
});

describe('DELETE /api/categories/:id', () => {
  it('기본 카테고리 삭제 시도 시 403을 반환한다', async () => {
    const res = await request(app)
      .delete(`/api/categories/${defaultCategoryId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('DEFAULT_CATEGORY_PROTECTED');
  });
});
