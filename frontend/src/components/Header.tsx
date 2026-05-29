import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useUpdateMe } from '../features/profile/hooks/useProfile';
import type { Theme } from '../types/user';
import './layout.css';

export default function Header() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const updateMe = useUpdateMe();

  function handleLogout() {
    clearAuth();
    window.location.href = '/login';
  }

  function handleThemeToggle() {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    updateMe.mutate({ theme: newTheme });
  }

  return (
    <header className="app-header">
      <span className="app-header-logo">TodoList</span>
      <div className="app-header-right">
        {user && <span className="app-header-username">{user.name}</span>}
        <button
          className="app-header-theme-toggle"
          onClick={handleThemeToggle}
          aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="app-header-logout" onClick={handleLogout}>
          {t('auth.logout')}
        </button>
      </div>
    </header>
  );
}
