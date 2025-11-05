import apiClient, { setTokens, clearTokens } from '../lib/api';
import { 
  LoginRequest, 
  LoginResponse, 
  TokenRefreshRequest, 
  TokenRefreshResponse,
  User,
  ApiResponse 
} from '../lib/types';

/**
 * 인증 관련 API 서비스
 */
const authService = {
  /**
   * 소셜 로그인 (OIDC)
   */
  login: async (provider: 'GOOGLE' | 'KAKAO' | 'NAVER', code: string, redirectUri: string): Promise<LoginResponse> => {
    const request: LoginRequest = {
      provider,
      code,
      redirectUri,
    };

    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', request);
    const { accessToken, refreshToken, user } = response.data.data;

    // 토큰과 사용자 정보 저장
    setTokens(accessToken, refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // 실패하더라도 로컬 데이터는 삭제
      clearTokens();
    }
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const request: TokenRefreshRequest = { refreshToken };
    const response = await apiClient.post<ApiResponse<TokenRefreshResponse>>('/auth/refresh', request);
    
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    setTokens(accessToken, newRefreshToken);

    return response.data.data;
  },

  /**
   * 현재 로그인한 사용자 정보 조회
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    const user = response.data.data;

    // 사용자 정보 갱신
    localStorage.setItem('user', JSON.stringify(user));

    return user;
  },

  /**
   * 회원 탈퇴
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/account');
    clearTokens();
  },

  /**
   * 소셜 로그인 URL 생성 (프론트엔드에서 사용)
   */
  getSocialLoginUrl: (provider: 'GOOGLE' | 'KAKAO' | 'NAVER'): string => {
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    const urls: Record<string, string> = {
      GOOGLE: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`,
      KAKAO: `https://kauth.kakao.com/oauth/authorize?client_id=YOUR_KAKAO_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`,
      NAVER: `https://nid.naver.com/oauth2.0/authorize?client_id=YOUR_NAVER_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=RANDOM_STATE`,
    };

    return urls[provider];
  },

  /**
   * 로컬스토리지에서 사용자 정보 가져오기
   */
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * 사용자 역할 확인
   */
  hasRole: (role: 'USER' | 'HOST' | 'ADMIN'): boolean => {
    const user = authService.getStoredUser();
    return user?.role === role;
  },

  /**
   * 호스트 권한 확인
   */
  isHost: (): boolean => {
    const user = authService.getStoredUser();
    return user?.role === 'HOST' || user?.role === 'ADMIN';
  },

  /**
   * 관리자 권한 확인
   */
  isAdmin: (): boolean => {
    const user = authService.getStoredUser();
    return user?.role === 'ADMIN';
  },
};

export default authService;
