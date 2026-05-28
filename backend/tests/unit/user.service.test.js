'use strict';

describe('user.service', () => {
  let userService;
  let userRepository;
  let passwordUtil;
  let authValidator;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/user.repository', () => ({
      findById: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    }));
    jest.doMock('../../src/utils/password', () => ({
      hash: jest.fn(),
      compare: jest.fn(),
    }));
    jest.doMock('../../src/validators/auth.validator', () => ({
      validatePassword: jest.fn(),
    }));

    userService = require('../../src/services/user.service');
    userRepository = require('../../src/repositories/user.repository');
    passwordUtil = require('../../src/utils/password');
    authValidator = require('../../src/validators/auth.validator');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('유효한 userId → password 없는 user 객체를 반환한다', async () => {
      const fakeUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_pw',
        name: '홍길동',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      userRepository.findById.mockResolvedValue(fakeUser);

      const result = await userService.getMe(1);

      expect(result).toEqual({
        id: fakeUser.id,
        email: fakeUser.email,
        name: fakeUser.name,
        createdAt: fakeUser.createdAt,
        updatedAt: fakeUser.updatedAt,
      });
    });

    it('존재하지 않는 userId → AppError(404, USER_NOT_FOUND) throw', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getMe(999)).rejects.toMatchObject({
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });
    });

    it('반환 객체에 password 필드가 없다', async () => {
      const fakeUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_pw',
        name: '홍길동',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(fakeUser);

      const result = await userService.getMe(1);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('updateMe', () => {
    it('name만 변경 → update 호출 확인, 업데이트된 user 반환', async () => {
      const updatedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_pw',
        name: '변경된이름',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateMe(1, { name: '변경된이름' });

      expect(userRepository.update).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledWith(1, { name: '변경된이름' });
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    });

    it('password만 변경 → validatePassword 호출 + hash 호출 + update 호출 확인', async () => {
      const updatedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'new_hashed_pw',
        name: '홍길동',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      authValidator.validatePassword.mockReturnValue(undefined);
      passwordUtil.hash.mockResolvedValue('new_hashed_pw');
      userRepository.update.mockResolvedValue(updatedUser);

      await userService.updateMe(1, { password: 'newPassword1' });

      expect(authValidator.validatePassword).toHaveBeenCalledWith('newPassword1');
      expect(passwordUtil.hash).toHaveBeenCalledWith('newPassword1');
      expect(userRepository.update).toHaveBeenCalledWith(1, { password: 'new_hashed_pw' });
    });

    it('name과 password 둘 다 변경 → 둘 다 처리됨 확인', async () => {
      const updatedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'new_hashed_pw',
        name: '새이름',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01'),
      };

      authValidator.validatePassword.mockReturnValue(undefined);
      passwordUtil.hash.mockResolvedValue('new_hashed_pw');
      userRepository.update.mockResolvedValue(updatedUser);

      await userService.updateMe(1, { name: '새이름', password: 'newPassword1' });

      expect(authValidator.validatePassword).toHaveBeenCalledWith('newPassword1');
      expect(passwordUtil.hash).toHaveBeenCalledWith('newPassword1');
      expect(userRepository.update).toHaveBeenCalledWith(1, {
        name: '새이름',
        password: 'new_hashed_pw',
      });
    });

    it('name, password 둘 다 없음 → AppError(400, INVALID_INPUT) throw', async () => {
      await expect(userService.updateMe(1, {})).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_INPUT',
      });

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('validatePassword throw 시 → 해당 에러가 그대로 전파된다', async () => {
      const { AppError } = require('../../src/middleware/error.middleware');
      const validationError = new AppError(
        '비밀번호는 최소 8자 이상이며 영문과 숫자를 포함해야 합니다.',
        400,
        'INVALID_PASSWORD'
      );

      authValidator.validatePassword.mockImplementation(() => {
        throw validationError;
      });

      await expect(userService.updateMe(1, { password: 'weak' })).rejects.toBe(validationError);

      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('반환 객체에 password 필드가 없다', async () => {
      const updatedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_pw',
        name: '변경된이름',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateMe(1, { name: '변경된이름' });

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('deleteMe', () => {
    it('유효한 userId + 정확한 password → deleteById 호출 확인', async () => {
      const fakeUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_pw',
        name: '홍길동',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(fakeUser);
      passwordUtil.compare.mockResolvedValue(true);
      userRepository.deleteById.mockResolvedValue(undefined);

      await userService.deleteMe(1, 'password1');

      expect(userRepository.deleteById).toHaveBeenCalledTimes(1);
      expect(userRepository.deleteById).toHaveBeenCalledWith(1);
    });

    it('존재하지 않는 userId → AppError(404, USER_NOT_FOUND) throw', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteMe(999, 'password1')).rejects.toMatchObject({
        statusCode: 404,
        code: 'USER_NOT_FOUND',
      });

      expect(userRepository.deleteById).not.toHaveBeenCalled();
    });

    it('비밀번호 불일치 → AppError(401, INVALID_CREDENTIALS) throw', async () => {
      const fakeUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_pw',
        name: '홍길동',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(fakeUser);
      passwordUtil.compare.mockResolvedValue(false);

      await expect(userService.deleteMe(1, 'wrongpassword')).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });

      expect(userRepository.deleteById).not.toHaveBeenCalled();
    });

    it('성공 시 반환값이 없다 (undefined)', async () => {
      const fakeUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_pw',
        name: '홍길동',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findById.mockResolvedValue(fakeUser);
      passwordUtil.compare.mockResolvedValue(true);
      userRepository.deleteById.mockResolvedValue(undefined);

      const result = await userService.deleteMe(1, 'password1');

      expect(result).toBeUndefined();
    });
  });
});
