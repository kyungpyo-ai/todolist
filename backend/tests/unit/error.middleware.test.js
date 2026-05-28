'use strict';

describe('error 미들웨어', () => {
  let errorMiddleware;
  let req, res, next;

  beforeEach(() => {
    jest.resetModules();
    errorMiddleware = require('../../src/middleware/error.middleware').errorMiddleware;

    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('err.statusCode가 400이면 400 상태코드로 응답한다', () => {
    const err = { statusCode: 400, message: '잘못된 요청', code: 'BAD_REQUEST' };
    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('err.statusCode가 없으면 500 상태코드로 응답한다', () => {
    const err = { message: '서버 오류', code: 'INTERNAL_ERROR' };
    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('응답 body에 success: false가 포함된다', () => {
    const err = { statusCode: 422, message: '유효성 오류', code: 'VALIDATION_ERROR' };
    errorMiddleware(err, req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  it('응답 body에 message와 code가 포함된다', () => {
    const err = { statusCode: 404, message: '리소스를 찾을 수 없습니다.', code: 'NOT_FOUND' };
    errorMiddleware(err, req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('리소스를 찾을 수 없습니다.');
    expect(body.code).toBe('NOT_FOUND');
  });

  it('500 응답 body에 stack이 포함되지 않는다', () => {
    const err = new Error('예상치 못한 오류');
    err.code = 'INTERNAL_ERROR';
    // statusCode 미설정 → 500으로 처리
    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body).not.toHaveProperty('stack');
  });
});
