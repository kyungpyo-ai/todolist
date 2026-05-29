import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getMe, updateMe, deleteMe } from '../../../api/userApi';
import type { UpdateMeRequest, DeleteMeRequest } from '../../../api/userApi';
import { useAuthStore } from '../../../stores/authStore';

export function useGetMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (data: UpdateMeRequest) => updateMe(data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (token) {
        setAuth(token, user);
      }
    },
  });
}

export function useDeleteMe() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: DeleteMeRequest) => deleteMe(data),
    onSuccess: () => {
      clearAuth();
      navigate('/login');
    },
  });
}
