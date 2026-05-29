import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../../../api/authApi';
import type { LoginRequest, SignupRequest } from '../../../api/authApi';
import { useAuthStore } from '../../../stores/authStore';
import { useUiStore } from '../../../stores/uiStore';
import i18n from '../../../i18n';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (result) => {
      setAuth(result.token, result.user);
      const { setTheme, setLanguage } = useUiStore.getState();
      setTheme(result.user.theme ?? 'light');
      setLanguage(result.user.language ?? 'ko');
      document.documentElement.setAttribute('data-theme', result.user.theme ?? 'light');
      i18n.changeLanguage(result.user.language ?? 'ko');
      navigate('/todos');
    },
  });
}

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupRequest) => signup(data),
    onSuccess: () => {
      navigate('/login');
    },
  });
}
