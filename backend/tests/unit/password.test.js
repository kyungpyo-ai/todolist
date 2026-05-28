'use strict';

describe('password 유틸리티', () => {
  let passwordUtil;

  beforeEach(() => {
    process.env.BCRYPT_SALT_ROUNDS = '10';
    jest.resetModules();
    passwordUtil = require('../../src/utils/password');
  });

  describe('hash()', () => {
    it('평문 비밀번호와 다른 문자열을 반환한다', async () => {
      const plain = 'myPassword123';
      const hashed = await passwordUtil.hash(plain);
      expect(hashed).not.toBe(plain);
      expect(typeof hashed).toBe('string');
    });

    it('동일한 평문을 두 번 해시해도 서로 다른 값을 반환한다 (salt 랜덤)', async () => {
      const plain = 'myPassword123';
      const hash1 = await passwordUtil.hash(plain);
      const hash2 = await passwordUtil.hash(plain);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare()', () => {
    it('평문과 해시가 일치하면 true를 반환한다', async () => {
      const plain = 'correctPassword';
      const hashed = await passwordUtil.hash(plain);
      const result = await passwordUtil.compare(plain, hashed);
      expect(result).toBe(true);
    });

    it('평문과 해시가 불일치하면 false를 반환한다', async () => {
      const plain = 'correctPassword';
      const hashed = await passwordUtil.hash(plain);
      const result = await passwordUtil.compare('wrongPassword', hashed);
      expect(result).toBe(false);
    });
  });
});
