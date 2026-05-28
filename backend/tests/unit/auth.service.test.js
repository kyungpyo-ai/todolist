'use strict';

describe('AuthService - signup', () => {
  let authService;
  let userRepository;
  let categoryRepository;
  let passwordUtil;
  let jwtUtil;
  let authValidator;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/user.repository', () => ({
      findByEmail: jest.fn(),
      create: jest.fn(),
    }));
    jest.doMock('../../src/repositories/category.repository', () => ({
      create: jest.fn(),
    }));
    jest.doMock('../../src/utils/password', () => ({
      hash: jest.fn(),
      compare: jest.fn(),
    }));
    jest.doMock('../../src/utils/jwt', () => ({
      sign: jest.fn(),
    }));
    jest.doMock('../../src/validators/auth.validator', () => ({
      validateSignupBody: jest.fn(),
    }));

    authService = require('../../src/services/auth.service');
    userRepository = require('../../src/repositories/user.repository');
    categoryRepository = require('../../src/repositories/category.repository');
    passwordUtil = require('../../src/utils/password');
    jwtUtil = require('../../src/utils/jwt');
    authValidator = require('../../src/validators/auth.validator');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 입력 시 password를 제외한 user 객체를 반환한다', async () => {
    const fakeUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_pw',
      name: '홍길동',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    authValidator.validateSignupBody.mockReturnValue(undefined);
    userRepository.findByEmail.mockResolvedValue(null);
    passwordUtil.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue(fakeUser);
    categoryRepository.create.mockResolvedValue({ id: 1, name: '기본' });

    const result = await authService.signup({
      email: 'test@example.com',
      password: 'password1',
      name: '홍길동',
    });

    expect(result).toEqual({
      id: fakeUser.id,
      email: fakeUser.email,
      name: fakeUser.name,
      createdAt: fakeUser.createdAt,
      updatedAt: fakeUser.updatedAt,
    });
  });

  it('유효한 입력 시 기본 카테고리가 자동 생성된다', async () => {
    const fakeUser = {
      id: 42,
      email: 'test@example.com',
      password: 'hashed_pw',
      name: '홍길동',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    authValidator.validateSignupBody.mockReturnValue(undefined);
    userRepository.findByEmail.mockResolvedValue(null);
    passwordUtil.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue(fakeUser);
    categoryRepository.create.mockResolvedValue({ id: 1, name: '기본' });

    await authService.signup({
      email: 'test@example.com',
      password: 'password1',
      name: '홍길동',
    });

    expect(categoryRepository.create).toHaveBeenCalledTimes(1);
    expect(categoryRepository.create).toHaveBeenCalledWith({
      userId: fakeUser.id,
      name: '기본',
      isDefault: true,
    });
  });

  it('이메일 중복 시 409 AppError를 throw한다', async () => {
    const { AppError } = require('../../src/middleware/error.middleware');

    authValidator.validateSignupBody.mockReturnValue(undefined);
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com' });

    await expect(
      authService.signup({ email: 'dup@example.com', password: 'password1', name: '홍길동' })
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'EMAIL_CONFLICT',
    });
  });

  it('validator가 throw하면 해당 에러가 그대로 전파된다', async () => {
    const { AppError } = require('../../src/middleware/error.middleware');
    const validationError = new AppError('유효하지 않은 이메일 형식입니다.', 400, 'INVALID_EMAIL');

    authValidator.validateSignupBody.mockImplementation(() => {
      throw validationError;
    });

    await expect(
      authService.signup({ email: 'bad-email', password: 'password1', name: '홍길동' })
    ).rejects.toBe(validationError);
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

    authValidator.validateSignupBody.mockReturnValue(undefined);
    userRepository.findByEmail.mockResolvedValue(null);
    passwordUtil.hash.mockResolvedValue('hashed_pw');
    userRepository.create.mockResolvedValue(fakeUser);
    categoryRepository.create.mockResolvedValue({ id: 1, name: '기본' });

    const result = await authService.signup({
      email: 'test@example.com',
      password: 'password1',
      name: '홍길동',
    });

    expect(result).not.toHaveProperty('password');
  });
});

describe('AuthService - login', () => {
  let authService;
  let userRepository;
  let passwordUtil;
  let jwtUtil;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('../../src/repositories/user.repository', () => ({
      findByEmail: jest.fn(),
      create: jest.fn(),
    }));
    jest.doMock('../../src/repositories/category.repository', () => ({
      create: jest.fn(),
    }));
    jest.doMock('../../src/utils/password', () => ({
      hash: jest.fn(),
      compare: jest.fn(),
    }));
    jest.doMock('../../src/utils/jwt', () => ({
      sign: jest.fn(),
    }));
    jest.doMock('../../src/validators/auth.validator', () => ({
      validateSignupBody: jest.fn(),
    }));

    authService = require('../../src/services/auth.service');
    userRepository = require('../../src/repositories/user.repository');
    passwordUtil = require('../../src/utils/password');
    jwtUtil = require('../../src/utils/jwt');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 자격증명으로 로그인 시 { token, user }를 반환한다', async () => {
    const fakeUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_pw',
      name: '홍길동',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.findByEmail.mockResolvedValue(fakeUser);
    passwordUtil.compare.mockResolvedValue(true);
    jwtUtil.sign.mockReturnValue('jwt_token_string');

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password1',
    });

    expect(result).toHaveProperty('token', 'jwt_token_string');
    expect(result).toHaveProperty('user');
  });

  it('이메일이 존재하지 않으면 401 AppError를 throw한다', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.login({ email: 'notfound@example.com', password: 'password1' })
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('비밀번호가 불일치하면 401 AppError를 throw한다', async () => {
    const fakeUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_pw',
      name: '홍길동',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.findByEmail.mockResolvedValue(fakeUser);
    passwordUtil.compare.mockResolvedValue(false);

    await expect(
      authService.login({ email: 'test@example.com', password: 'wrongpass' })
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('반환된 user 객체에 password 필드가 없다', async () => {
    const fakeUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_pw',
      name: '홍길동',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.findByEmail.mockResolvedValue(fakeUser);
    passwordUtil.compare.mockResolvedValue(true);
    jwtUtil.sign.mockReturnValue('jwt_token_string');

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password1',
    });

    expect(result.user).not.toHaveProperty('password');
  });

  it('email 또는 password 미입력 시 400 AppError를 throw한다', async () => {
    await expect(
      authService.login({ email: '', password: 'password1' })
    ).rejects.toMatchObject({ statusCode: 400 });

    await expect(
      authService.login({ email: 'test@example.com', password: '' })
    ).rejects.toMatchObject({ statusCode: 400 });

    await expect(
      authService.login({ email: null, password: null })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
