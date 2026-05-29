import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from '../uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ theme: 'light', language: 'ko' });
  });

  it('기본 theme이 "light"이다', () => {
    const state = useUiStore.getState();
    expect(state.theme).toBe('light');
  });

  it('setTheme 호출 시 theme이 변경된다', () => {
    useUiStore.getState().setTheme('dark');
    expect(useUiStore.getState().theme).toBe('dark');
  });

  it('기본 language가 "ko"이다', () => {
    const state = useUiStore.getState();
    expect(state.language).toBe('ko');
  });

  it('setLanguage 호출 시 language가 변경된다', () => {
    useUiStore.getState().setLanguage('en');
    expect(useUiStore.getState().language).toBe('en');
  });
});
