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

  // ⭐️⭐️⭐️ 로그아웃 함수 수정 ⭐️⭐️⭐️
  logout: async (): Promise<void> => {
    try {
      // 1. 백엔드에 POST 요청 전송 (쿠키 포함)
      await apiClient.post('/logout');
    } catch (error) {
      console.error("Logout request failed", error);
    } finally {
      // 2. 요청 성공/실패 여부와 상관없이 브라우저 새로고침으로 상태 초기화
      // (이렇게 하면 리액트 앱이 초기화되면서 로그인 상태가 풀립니다)
      window.location.href = '/';
    }
  },

  upgradeToHost: async (data: { businessLicenseNumber: string; description: string }): Promise<void> => {
    await apiClient.post('/api/user/upgrade-to-host', data);
  },
};

export default authService;