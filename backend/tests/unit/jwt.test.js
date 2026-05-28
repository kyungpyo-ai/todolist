'use strict';

const jwt = require('jsonwebtoken');

describe('jwt 유틸리티', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';
    jest.resetModules();
  });

  let jwtUtil;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '7d';
    jest.resetModules();
    jwtUtil = require('../../src/utils/jwt');
  });

  describe('sign()', () => {
    it('유효한 JWT 토큰 문자열을 반환한다', () => {
      const token = jwtUtil.sign(1);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('생성된 토큰의 payload에 userId가 포함된다', () => {
      const userId = 42;
      const token = jwtUtil.sign(userId);
      const decoded = jwt.decode(token);
      expect(decoded.userId).toBe(userId);
    });
  });

  describe('verify()', () => {
    it('유효한 토큰을 검증하면 decoded.userId를 반환한다', () => {
      const userId = 7;
      const token = jwtUtil.sign(userId);
      const decoded = jwtUtil.verify(token);
      expect(decoded.userId).toBe(userId);
    });

    it('변조된 토큰을 검증하면 에러를 throw한다', () => {
      const token = jwtUtil.sign(1);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => jwtUtil.verify(tampered)).toThrow();
    });

    it('만료된 토큰을 검증하면 에러를 throw한다', (done) => {
      const expiredToken = jwt.sign(
        { userId: 99 },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );
      setTimeout(() => {
        expect(() => jwtUtil.verify(expiredToken)).toThrow();
        done();
      }, 10);
    });
  });
});
