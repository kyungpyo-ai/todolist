import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Language } from '../types/user';

interface UiState {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ko',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    { name: 'ui-storage' }
  )
);
