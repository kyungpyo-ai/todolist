import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  getPasswordError,
  getEmailError,
} from '../validationUtils';

describe('isValidEmail', () => {
  it('올바른 이메일 형식이면 true를 반환한다', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co.kr')).toBe(true);
  });

  it('@가 없으면 false를 반환한다', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('도메인이 없으면 false를 반환한다', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('빈 문자열이면 false를 반환한다', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('공백이 있으면 false를 반환한다', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('8자 이상 영문+숫자 조합이면 true를 반환한다', () => {
    expect(isValidPassword('password1')).toBe(true);
    expect(isValidPassword('Test1234')).toBe(true);
  });

  it('7자이면 false를 반환한다', () => {
    expect(isValidPassword('pass123')).toBe(false);
  });

  it('숫자가 없으면 false를 반환한다', () => {
    expect(isValidPassword('password')).toBe(false);
  });

  it('영문자가 없으면 false를 반환한다', () => {
    expect(isValidPassword('12345678')).toBe(false);
  });
});

describe('getPasswordError', () => {
  it('빈 문자열이면 오류 메시지를 반환한다', () => {
    expect(getPasswordError('')).toBe('비밀번호를 입력해주세요.');
  });

  it('8자 미만이면 오류 메시지를 반환한다', () => {
    expect(getPasswordError('abc1')).toBe('비밀번호는 최소 8자 이상이어야 합니다.');
  });

  it('영문자가 없으면 오류 메시지를 반환한다', () => {
    expect(getPasswordError('12345678')).toBe('비밀번호는 영문자를 포함해야 합니다.');
  });

  it('숫자가 없으면 오류 메시지를 반환한다', () => {
    expect(getPasswordError('abcdefgh')).toBe('비밀번호는 숫자를 포함해야 합니다.');
  });

  it('유효한 비밀번호이면 null을 반환한다', () => {
    expect(getPasswordError('password1')).toBeNull();
  });
});

describe('getEmailError', () => {
  it('빈 문자열이면 오류 메시지를 반환한다', () => {
    expect(getEmailError('')).toBe('이메일을 입력해주세요.');
  });

  it('잘못된 형식이면 오류 메시지를 반환한다', () => {
    expect(getEmailError('notanemail')).toBe('올바른 이메일 형식이 아닙니다.');
  });

  it('유효한 이메일이면 null을 반환한다', () => {
    expect(getEmailError('user@example.com')).toBeNull();
  });
});
