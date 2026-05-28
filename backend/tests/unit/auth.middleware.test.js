'use strict';

describe('auth 미들웨어', () => {
  let authMiddleware;
  let jwtUtil;
  let req, res, next;

  beforeEach(() => {
    jest.resetModules();
    jest.doMock('../../src/utils/jwt', () => ({
      verify: jest.fn(),
    }));
    authMiddleware = require('../../src/middleware/auth.middleware');
    jwtUtil = require('../../src/utils/jwt');

    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Authorization 헤더가 없으면 401을 응답한다', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, code: 'UNAUTHORIZED' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('Bearer 형식이 아닌 경우 (Basic token) 401을 응답한다', () => {
    req.headers['authorization'] = 'Basic sometoken';
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, code: 'UNAUTHORIZED' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('유효한 토큰이면 req.userId를 설정하고 next()를 호출한다', () => {
    const userId = 5;
    jwtUtil.verify.mockReturnValue({ userId });
    req.headers['authorization'] = 'Bearer validtoken';

    authMiddleware(req, res, next);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('verify가 throw하면 401을 응답한다', () => {
    jwtUtil.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });
    req.headers['authorization'] = 'Bearer expiredtoken';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('401 응답 body에 { success: false, code: "UNAUTHORIZED" }가 포함된다', () => {
    authMiddleware(req, res, next);

    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.code).toBe('UNAUTHORIZED');
  });
});
