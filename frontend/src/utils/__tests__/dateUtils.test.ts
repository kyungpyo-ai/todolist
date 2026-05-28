import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate, isEndDateValid, isOverdue, toISODateString, todayString } from '../dateUtils';

describe('formatDate', () => {
  it('날짜 문자열을 YYYY-MM-DD 형식으로 변환한다', () => {
    expect(formatDate('2026-05-28T00:00:00.000Z')).toBe('2026-05-28');
  });

  it('이미 YYYY-MM-DD 형식인 경우도 처리한다', () => {
    const result = formatDate('2026-01-15');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isEndDateValid', () => {
  it('종료일이 시작일보다 이후이면 true를 반환한다', () => {
    expect(isEndDateValid('2026-05-01', '2026-05-10')).toBe(true);
  });

  it('종료일과 시작일이 같으면 true를 반환한다', () => {
    expect(isEndDateValid('2026-05-01', '2026-05-01')).toBe(true);
  });

  it('종료일이 시작일보다 이전이면 false를 반환한다', () => {
    expect(isEndDateValid('2026-05-10', '2026-05-01')).toBe(false);
  });

  it('시작일이 빈 문자열이면 true를 반환한다', () => {
    expect(isEndDateValid('', '2026-05-01')).toBe(true);
  });

  it('종료일이 빈 문자열이면 true를 반환한다', () => {
    expect(isEndDateValid('2026-05-01', '')).toBe(true);
  });
});

describe('isOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-28'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('종료일이 오늘보다 이전이면 true를 반환한다', () => {
    expect(isOverdue('2026-05-27')).toBe(true);
  });

  it('종료일이 오늘과 같으면 false를 반환한다', () => {
    expect(isOverdue('2026-05-28')).toBe(false);
  });

  it('종료일이 오늘보다 이후이면 false를 반환한다', () => {
    expect(isOverdue('2026-05-29')).toBe(false);
  });
});

describe('toISODateString', () => {
  it('Date 객체를 YYYY-MM-DD 형식 문자열로 변환한다', () => {
    const date = new Date('2026-05-28T12:00:00Z');
    const result = toISODateString(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('todayString', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-28'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('오늘 날짜를 YYYY-MM-DD 형식으로 반환한다', () => {
    expect(todayString()).toBe('2026-05-28');
  });
});
