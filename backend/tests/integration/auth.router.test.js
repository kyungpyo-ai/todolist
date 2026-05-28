'use strict';

const request = require('supertest');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const app = require('../../src/config/app');
const { pool } = require('../../src/config/db');

const TEST_EMAIL_DOMAIN = '@test-be03.example';
const SIGNUP_EMAIL = `test-signup${TEST_EMAIL_DOMAIN}`;
const LOGIN_EMAIL = `test-login${TEST_EMAIL_DOMAIN}`;
const VALID_PASSWORD = 'Password1';
const VALID_NAME = '테스트유저';

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '%${TEST_EMAIL_DOMAIN}'`);
  await pool.end();
});

describe('POST /api/auth/signup', () => {
  it('유효한 요청 시 201과 { success: true, data: { user } }를 반환하며 user에 password가 없다', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: SIGNUP_EMAIL, password: VALID_PASSWORD, name: VALID_NAME });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('user');

    const { user } = res.body.data;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email', SIGNUP_EMAIL);
    expect(user).toHaveProperty('name', VALID_NAME);
    expect(user).not.toHaveProperty('password');
  });

  it('이메일 형식이 잘못된 경우 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', password: VALID_PASSWORD, name: VALID_NAME });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('비밀번호가 8자 미만인 경우 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: `short-pw${TEST_EMAIL_DOMAIN}`, password: 'Ab1', name: VALID_NAME });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('이름이 누락된 경우 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: `no-name${TEST_EMAIL_DOMAIN}`, password: VALID_PASSWORD });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('이미 가입된 이메일로 재가입 시 409를 반환한다', async () => {
    // SIGNUP_EMAIL은 첫 번째 테스트에서 이미 가입됨
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: SIGNUP_EMAIL, password: VALID_PASSWORD, name: VALID_NAME });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('EMAIL_CONFLICT');
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    // 로그인 테스트용 계정 사전 생성
    await request(app)
      .post('/api/auth/signup')
      .send({ email: LOGIN_EMAIL, password: VALID_PASSWORD, name: VALID_NAME });
  });

  it('유효한 자격증명으로 로그인 시 200과 { success: true, data: { token, user } }를 반환하며 token이 string이다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: LOGIN_EMAIL, password: VALID_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('존재하지 않는 이메일로 로그인 시 401을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: `notfound${TEST_EMAIL_DOMAIN}`, password: VALID_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('비밀번호가 불일치하면 401을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: LOGIN_EMAIL, password: 'WrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
