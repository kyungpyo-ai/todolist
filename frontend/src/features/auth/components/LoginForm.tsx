import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import './auth.css';
import { useLogin } from '../hooks/useAuth';

export default function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate: loginMutate, isPending, error } = useLogin();

  const serverErrorMessage = error
    ? (error as AxiosError<{ message: string }>).response?.data?.message ||
      t('auth.errors.loginFailed')
    : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutate({ email, password });
  }

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1 className="auth-card-title">{t('auth.login')}</h1>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverErrorMessage && (
          <div className="auth-server-error">{serverErrorMessage}</div>
        )}
        <div className="auth-field">
          <label className="auth-label" htmlFor="login-email">
            {t('auth.email')}
          </label>
          <input
            id="login-email"
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="login-password">
            {t('auth.password')}
          </label>
          <input
            id="login-password"
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            autoComplete="current-password"
            required
          />
        </div>
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isPending}
        >
          {isPending ? t('common.loading') : t('auth.loginButton')}
        </button>
        <p className="auth-link-text">
          {t('auth.noAccount')}{' '}
          <Link to="/signup" className="auth-link">
            {t('auth.goToSignup')}
          </Link>
        </p>
      </form>
    </div>
  );
}
