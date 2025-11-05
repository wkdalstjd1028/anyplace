// src/service/authService.ts
import apiClient from '../lib/api';
import { User } from '../lib/types';

const authService = {
  /**
   * 현재 로그인한 사용자 정보 조회
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/me');
    return response.data;
  },

  /**
   * OIDC 소셜 로그인 페이지로 이동
   */
  redirectToOidcLogin: (provider: 'google' | 'naver' | 'kakao') => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    window.location.href = 'http://localhost:8080/logout';
  },

  // ... (hasRole, isHost, isAdmin 등 기존 함수) ...

  // ★★★ (추가) 호스트 업그레이드 신청 API ★★★
  upgradeToHost: async (data: { businessLicenseNumber: string; description: string }): Promise<void> => {
    await apiClient.post('/api/user/upgrade-to-host', data);
  },
};

export default authService;