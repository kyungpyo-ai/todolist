import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import './auth.css';
import { useSignup } from '../hooks/useAuth';
import { getEmailError, getPasswordError } from '../../../utils/validationUtils';

export default function SignupForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { mutate: signupMutate, isPending, error } = useSignup();

  const serverError = error as AxiosError<{ message: string }> | null;
  const serverErrorMessage = serverError
    ? serverError.response?.status === 409
      ? t('auth.errors.duplicateEmail')
      : serverError.response?.data?.message || '회원가입 중 오류가 발생했습니다.'
    : null;

  function handleEmailBlur() {
    setEmailError(getEmailError(email));
  }

  function handlePasswordBlur() {
    setPasswordError(getPasswordError(password));
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
    if (emailError !== null) {
      setEmailError(getEmailError(e.target.value));
    }
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (passwordError !== null) {
      setPasswordError(getPasswordError(e.target.value));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailErr = getEmailError(email);
    const passwordErr = getPasswordError(password);
    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (!name.trim() || emailErr || passwordErr) {
      return;
    }
    signupMutate({ name: name.trim(), email, password });
  }

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1 className="auth-card-title">{t('auth.signup')}</h1>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverErrorMessage && (
          <div className="auth-server-error">{serverErrorMessage}</div>
        )}
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-name">
            {t('auth.name')}
          </label>
          <input
            id="signup-name"
            className="auth-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.namePlaceholder')}
            autoComplete="name"
            required
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-email">
            {t('auth.email')}
          </label>
          <input
            id="signup-email"
            className={`auth-input${emailError ? ' auth-input--error' : ''}`}
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
            required
          />
          {emailError && <p className="auth-field-error">{emailError}</p>}
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-password">
            {t('auth.password')}
          </label>
          <input
            id="signup-password"
            className={`auth-input${passwordError ? ' auth-input--error' : ''}`}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            placeholder="영문+숫자 8자 이상"
            autoComplete="new-password"
            required
          />
          {passwordError && <p className="auth-field-error">{passwordError}</p>}
        </div>
        <button
          type="submit"
          className="auth-btn-primary"
          disabled={isPending}
        >
          {isPending ? t('common.deleting') : t('auth.signupButton')}
        </button>
        <p className="auth-link-text">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="auth-link">
            {t('auth.goToLogin')}
          </Link>
        </p>
      </form>
    </div>
  );
}
