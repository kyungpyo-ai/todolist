import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useUiStore } from '../stores/uiStore';
import { useUpdateMe, useDeleteMe } from '../features/profile/hooks/useProfile';
import { getPasswordError } from '../utils/validationUtils';
import type { Language } from '../types/user';
import i18n from '../i18n';
import '../features/profile/profile.css';

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const language = useUiStore((state) => state.language);
  const setLanguage = useUiStore((state) => state.setLanguage);

  // 이름 변경 섹션
  const [name, setName] = useState(user?.name ?? '');
  const [nameServerError, setNameServerError] = useState('');

  // 비밀번호 변경 섹션
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [passwordServerError, setPasswordServerError] = useState('');

  // 회원 탈퇴 다이얼로그
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const updateMe = useUpdateMe();
  const deleteMe = useDeleteMe();

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const isNameChanged = name.trim() !== '' && name.trim() !== user?.name;

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameServerError('');
    if (!name.trim()) return;
    updateMe.mutate({ name: name.trim() }, {
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        setNameServerError(msg ?? t('profile.errors.saveFailed'));
      },
    });
  }

  const isPasswordFilled = newPassword.length > 0;

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordServerError('');

    const pwErr = getPasswordError(newPassword);
    if (pwErr) { setPasswordError(pwErr); return; }
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setConfirmError(t('profile.errors.passwordMismatch'));
      return;
    }
    setConfirmError('');

    updateMe.mutate({ password: newPassword }, {
      onSuccess: () => {
        setNewPassword('');
        setConfirmPassword('');
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        setPasswordServerError(msg ?? t('profile.errors.saveFailed'));
      },
    });
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    if (value && newPassword !== value) {
      setConfirmError(t('profile.errors.passwordMismatch'));
    } else {
      setConfirmError('');
    }
  }

  function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLang = e.target.value as Language;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    updateMe.mutate({ language: newLang });
  }

  function handleDeleteOpen() {
    setDeletePassword('');
    setDeleteError('');
    setIsDeleteOpen(true);
  }

  function handleDeleteConfirm() {
    if (!deletePassword) {
      setDeleteError(t('profile.errors.passwordRequired'));
      return;
    }
    deleteMe.mutate({ password: deletePassword }, {
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        setDeleteError(msg ?? t('profile.errors.deleteFailed'));
      },
    });
  }

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">{t('profile.title')}</h1>

      {/* 이름 변경 */}
      <section className="profile-section">
        <h2 className="profile-section-title">{t('profile.nameSection')}</h2>
        <form onSubmit={handleNameSubmit} noValidate>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-email">{t('profile.email')}</label>
            <input
              id="profile-email"
              className="profile-input profile-input--readonly"
              type="email"
              value={user?.email ?? ''}
              readOnly
            />
          </div>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-name">{t('profile.name')}</label>
            <input
              id="profile-name"
              className="profile-input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameServerError(''); }}
              placeholder={t('profile.namePlaceholder')}
              disabled={updateMe.isPending}
            />
            {nameServerError && <p className="profile-error">{nameServerError}</p>}
          </div>
          <div className="profile-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={!isNameChanged || updateMe.isPending}
            >
              {updateMe.isPending ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </section>

      {/* 비밀번호 변경 */}
      <section className="profile-section">
        <h2 className="profile-section-title">{t('profile.passwordSection')}</h2>
        <form onSubmit={handlePasswordSubmit} noValidate>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-new-password">
              {t('profile.newPassword')} <span className="profile-required">*</span>
            </label>
            <input
              id="profile-new-password"
              className={`profile-input${passwordError ? ' profile-input--error' : ''}`}
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
              placeholder={t('profile.newPasswordPlaceholder')}
              disabled={updateMe.isPending}
            />
            {passwordError && <p className="profile-error">{passwordError}</p>}
          </div>
          <div className="profile-field">
            <label className="profile-label" htmlFor="profile-confirm-password">
              {t('profile.confirmPassword')} <span className="profile-required">*</span>
            </label>
            <input
              id="profile-confirm-password"
              className={`profile-input${confirmError ? ' profile-input--error' : ''}`}
              type="password"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              placeholder={t('profile.confirmPasswordPlaceholder')}
              disabled={updateMe.isPending}
            />
            {confirmError && <p className="profile-error">{confirmError}</p>}
          </div>
          {passwordServerError && <p className="profile-error">{passwordServerError}</p>}
          <div className="profile-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={!isPasswordFilled || updateMe.isPending}
            >
              {updateMe.isPending ? t('common.saving') : '변경'}
            </button>
          </div>
        </form>
      </section>

      {/* 언어 설정 */}
      <section className="profile-section">
        <h2 className="profile-section-title">{t('profile.languageSection')}</h2>
        <div className="profile-field">
          <label className="profile-label" htmlFor="profile-language">
            {t('profile.languageLabel')}
          </label>
          <select
            id="profile-language"
            className="profile-input"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="ko">{t('profile.language.ko')}</option>
            <option value="en">{t('profile.language.en')}</option>
          </select>
        </div>
      </section>

      {/* 회원 탈퇴 */}
      <section className="profile-section profile-section--danger">
        <h2 className="profile-section-title">{t('profile.deleteSection')}</h2>
        <p className="profile-section-desc">
          {t('profile.deleteDesc')}
        </p>
        <button className="btn-danger" onClick={handleDeleteOpen}>
          {t('profile.deleteButton')}
        </button>
      </section>

      {/* 탈퇴 확인 다이얼로그 */}
      {isDeleteOpen && (
        <div className="confirm-dialog-overlay">
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="confirm-dialog-header">
              <h2 className="confirm-dialog-title" id="delete-dialog-title">
                {t('profile.deleteConfirmTitle')}
              </h2>
            </div>
            <div className="confirm-dialog-body">
              <p>{t('profile.deleteConfirmMessage')}</p>
              <div className="profile-field" style={{ marginTop: 12 }}>
                <label className="profile-label" htmlFor="delete-password">
                  {t('profile.deletePasswordLabel')}
                </label>
                <input
                  id="delete-password"
                  className={`profile-input${deleteError ? ' profile-input--error' : ''}`}
                  type="password"
                  value={deletePassword}
                  onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  placeholder={t('profile.deletePasswordPlaceholder')}
                  disabled={deleteMe.isPending}
                  autoFocus
                />
                {deleteError && <p className="profile-error">{deleteError}</p>}
              </div>
            </div>
            <div className="confirm-dialog-actions">
              <button
                className="btn-secondary"
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleteMe.isPending}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteConfirm}
                disabled={deleteMe.isPending}
              >
                {deleteMe.isPending ? t('common.deleting') : t('profile.deleteButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
