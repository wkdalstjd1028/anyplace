import apiClient from '../lib/api';
import { User } from '../lib/types'; // (User 타입이 정의된 곳)

/**
 * 인증 관련 API 서비스 (OIDC 세션 방식)
 */
const authService = {
  /**
   * 현재 로그인한 사용자 정보 조회
   * (Spring Boot의 /api/me 호출)
   */
  getCurrentUser: async (): Promise<User> => {
    // ★★★ 수정: /auth/me -> /api/me, .data.data -> .data
    const response = await apiClient.get<User>('/api/me');
    return response.data;
  },

  /**
   * OIDC 소셜 로그인 페이지로 이동
   */
  redirectToOidcLogin: (provider: 'google' | 'naver' | 'kakao') => {
    // ★★★ 수정: Spring Security OIDC 엔드포인트로 리디렉션
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    // ★★★ 수정: Spring Security 기본 /logout 엔드포인트로 리디렉션
    window.location.href = 'http://localhost:8080/logout';
  },

  /**
   * 회원 탈퇴 (Spring Boot에 /api/account 엔드포인트가 필요합니다)
   */
  deleteAccount: async (): Promise<void> => {
    // ★★★ 수정: API 경로 변경
    await apiClient.delete('/api/account');
    // (토큰 로직 삭제)
  },

  /**
   * 사용자 역할 확인 (App.tsx의 user 객체를 받아와야 함)
   */
  hasRole: (user: User | null, role: 'ROLE_GUEST' | 'ROLE_HOST' | 'ROLE_ADMIN'): boolean => {
    return user?.role === role;
  },

  /**
   * 호스트 권한 확인 (App.tsx의 user 객체를 받아와야 함)
   */
  isHost: (user: User | null): boolean => {
    return user?.role === 'ROLE_HOST' || user?.role === 'ROLE_ADMIN';
  },

  /**
   * 관리자 권한 확인 (App.tsx의 user 객체를 받아와야 함)
   */
  isAdmin: (user: User | null): boolean => {
    return user?.role === 'ROLE_ADMIN';
  },
};

export default authService;