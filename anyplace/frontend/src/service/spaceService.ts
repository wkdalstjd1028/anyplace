// spaceService.ts (수정된 코드)

import apiClient from '../lib/api';
import {
  Space,
  SpaceCreateRequest,
  SpaceUpdateRequest,
  SpaceSearchParams,
  PaginatedResponse,
  ApiResponse // 이 타입은 사실상 사용되지 않지만, 호환성을 위해 남겨둘 수 있습니다.
} from '../lib/types';

/**
 * 공간 관련 API 서비스
 */
const spaceService = {
  /**
   * 공간 목록 조회 (검색 포함)
   */
  searchSpaces: async (params: SpaceSearchParams = {}): Promise<PaginatedResponse<Space>> => {
    // ★★★ 수정: 반환 타입을 PaginatedResponse<Space>로 직접 받습니다.
    const response = await apiClient.get<PaginatedResponse<Space>>('/api/spaces', {
      params: {
        keyword: params.keyword,
        city: params.city,
        district: params.district,
        type: params.type,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        minCapacity: params.minCapacity,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        page: params.page || 0,
        size: params.size || 20,
        sort: params.sort || 'createdAt,desc',
      },
    });

    // ★★★ 수정: response.data.data가 아닌 response.data를 반환합니다.
    return response.data;
  },

  /**
   * 공간 상세 조회
   */
  getSpaceById: async (spaceId: string): Promise<Space> => {
    // ★★★ 수정: 반환 타입을 Space로 직접 받습니다.
    const response = await apiClient.get<Space>(`/api/spaces/${spaceId}`);
    // ★★★ 수정: response.data를 반환합니다.
    return response.data;
  },

  /**
   * 공간 등록 (호스트 전용)
   */
  createSpace: async (data: SpaceCreateRequest): Promise<Space> => {
    // ★★★ 수정: 반환 타입을 Space로 직접 받습니다.
    const response = await apiClient.post<Space>('/api/spaces', data);
    // ★★★ 수정: response.data를 반환합니다.
    return response.data;
  },

  /**
   * 공간 수정 (호스트 전용)
   */
  updateSpace: async (spaceId: string, data: SpaceUpdateRequest): Promise<Space> => {
    // ★★★ 수정: 반환 타입을 Space로 직접 받습니다.
    const response = await apiClient.put<Space>(`/api/spaces/${spaceId}`, data);
    // ★★★ 수정: response.data를 반환합니다.
    return response.data;
  },

  /**
   * 공간 삭제 (호스트 전용)
   */
  deleteSpace: async (spaceId: string): Promise<void> => {
    // ★★★ 수정: 반환값이 없으므로 .data 접근 불필요
    await apiClient.delete(`/api/spaces/${spaceId}`);
  },

  // --- (참고: 아래 함수들은 SpaceController.java에 정의되지 않았습니다.) ---
  // --- (만약 컨트롤러에 추가한다면, 아래와 같이 수정해야 합니다.) ---

  toggleSpaceStatus: async (spaceId: string, isActive: boolean): Promise<Space> => {
    const response = await apiClient.patch<Space>(`/api/spaces/${spaceId}/status`, {
      isActive,
    });
    return response.data;
  },

  getMySpaces: async (page = 0, size = 20): Promise<PaginatedResponse<Space>> => {
    const response = await apiClient.get<PaginatedResponse<Space>>('/api/spaces/my', {
      params: { page, size },
    });
    return response.data;
  },

  getRecommendedSpaces: async (limit = 8): Promise<Space[]> => {
    const response = await apiClient.get<Space[]>('/api/spaces/recommended', {
      params: { limit },
    });
    return response.data;
  },

  getPopularSpaces: async (limit = 8): Promise<Space[]> => {
    const response = await apiClient.get<Space[]>('/api/spaces/popular', {
      params: { limit },
    });
    return response.data;
  },

  getSpacesByLocation: async (city: string, district?: string, page = 0, size = 20): Promise<PaginatedResponse<Space>> => {
    const response = await apiClient.get<PaginatedResponse<Space>>('/api/spaces', {
      params: { city, district, page, size },
    });
    return response.data;
  },

  getSpacesByType: async (type: string, page = 0, size = 20): Promise<PaginatedResponse<Space>> => {
    const response = await apiClient.get<PaginatedResponse<Space>>('/api/spaces', {
      params: { type, page, size },
    });
    return response.data;
  },

  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    const response = await apiClient.post<string[]>('/api/spaces/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteImage: async (imageUrl: string): Promise<void> => {
    await apiClient.delete('/api/spaces/images', {
      data: { imageUrl },
    });
  },

  getSpaceStatistics: async (spaceId: string): Promise<any> => {
    const response = await apiClient.get<any>(`/api/spaces/${spaceId}/statistics`);
    return response.data;
  },
};

export default spaceService;