import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from './types';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초
});

// ============================================
// Request Interceptor (요청 전처리)
// ============================================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage에서 액세스 토큰 가져오기
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor (응답 후처리)
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답은 그대로 반환
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러 (인증 실패) 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰으로 새 액세스 토큰 발급
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // 새 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 리프레시 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // 로그인 페이지로 리다이렉트 (선택사항)
        window.location.href = '/';
        
        return Promise.reject(refreshError);
      }
    }

    // 에러 객체 구성
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: (error.response?.data as any)?.message || error.message || '알 수 없는 오류가 발생했습니다',
      code: (error.response?.data as any)?.code,
      details: (error.response?.data as any)?.details,
    };

    return Promise.reject(apiError);
  }
);

// ============================================
// 유틸리티 함수들
// ============================================

/**
 * 토큰 저장
 */
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * 토큰 제거 (로그아웃)
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * 현재 액세스 토큰 가져오기
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * 사용자가 로그인되어 있는지 확인
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

/**
 * 파일 업로드용 FormData 생성
 */
export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(key, item);
        } else {
          formData.append(key, JSON.stringify(item));
        }
      });
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    }
  });
  
  return formData;
};

export default apiClient;
