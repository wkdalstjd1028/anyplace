import apiClient from '../lib/api';
import { User } from '../lib/types';

const authService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/me');
    return response.data;
  },

  redirectToOidcLogin: (provider: 'google' | 'naver' | 'kakao') => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  },

  logout: async (): Promise<void> => {
    window.location.href = 'http://localhost:8080/logout';
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/api/account');
  },

  hasRole: (user: User | null, role: 'ROLE_GUEST' | 'ROLE_HOST' | 'ROLE_ADMIN'): boolean => {
    return user?.role === role;
  },

  isHost: (user: User | null): boolean => {
    return user?.role === 'ROLE_HOST' || user?.role === 'ROLE_ADMIN';
  },

  isAdmin: (user: User | null): boolean => {
    return user?.role === 'ROLE_ADMIN';
  },
};

export default authService;