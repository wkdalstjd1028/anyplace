import apiClient from '../lib/api';
import { 
  Space, 
  SpaceCreateRequest, 
  SpaceUpdateRequest, 
  SpaceSearchParams,
  PaginatedResponse,
  ApiResponse 
} from '../lib/types';

/**
 * 공간 관련 API 서비스
 */
const spaceService = {
  /**
   * 공간 목록 조회 (검색 포함)
   */
  searchSpaces: async (params: SpaceSearchParams = {}): Promise<PaginatedResponse<Space>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Space>>>('/spaces', {
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

    return response.data.data;
  },

  /**
   * 공간 상세 조회
   */
  getSpaceById: async (spaceId: string): Promise<Space> => {
    const response = await apiClient.get<ApiResponse<Space>>(`/spaces/${spaceId}`);
    return response.data.data;
  },

  /**
   * 공간 등록 (호스트 전용)
   */
  createSpace: async (data: SpaceCreateRequest): Promise<Space> => {
    const response = await apiClient.post<ApiResponse<Space>>('/spaces', data);
    return response.data.data;
  },

  /**
   * 공간 수정 (호스트 전용)
   */
  updateSpace: async (spaceId: string, data: SpaceUpdateRequest): Promise<Space> => {
    const response = await apiClient.put<ApiResponse<Space>>(`/spaces/${spaceId}`, data);
    return response.data.data;
  },

  /**
   * 공간 삭제 (호스트 전용)
   */
  deleteSpace: async (spaceId: string): Promise<void> => {
    await apiClient.delete(`/spaces/${spaceId}`);
  },

  /**
   * 공간 활성화/비활성화 (호스트 전용)
   */
  toggleSpaceStatus: async (spaceId: string, isActive: boolean): Promise<Space> => {
    const response = await apiClient.patch<ApiResponse<Space>>(`/spaces/${spaceId}/status`, {
      isActive,
    });
    return response.data.data;
  },

  /**
   * 내가 등록한 공간 목록 (호스트 전용)
   */
  getMySpaces: async (page = 0, size = 20): Promise<PaginatedResponse<Space>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Space>>>('/spaces/my', {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * 추천 공간 목록
   */
  getRecommendedSpaces: async (limit = 8): Promise<Space[]> => {
    const response = await apiClient.get<ApiResponse<Space[]>>('/spaces/recommended', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * 인기 공간 목록 (평점 및 리뷰 기반)
   */
  getPopularSpaces: async (limit = 8): Promise<Space[]> => {
    const response = await apiClient.get<ApiResponse<Space[]>>('/spaces/popular', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * 특정 지역의 공간 목록
   */
  getSpacesByLocation: async (city: string, district?: string, page = 0, size = 20): Promise<PaginatedResponse<Space>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Space>>>('/spaces', {
      params: {
        city,
        district,
        page,
        size,
      },
    });
    return response.data.data;
  },

  /**
   * 공간 타입별 목록
   */
  getSpacesByType: async (type: string, page = 0, size = 20): Promise<PaginatedResponse<Space>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Space>>>('/spaces', {
      params: {
        type,
        page,
        size,
      },
    });
    return response.data.data;
  },

  /**
   * 이미지 업로드
   */
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await apiClient.post<ApiResponse<string[]>>('/spaces/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  /**
   * 이미지 삭제
   */
  deleteImage: async (imageUrl: string): Promise<void> => {
    await apiClient.delete('/spaces/images', {
      data: { imageUrl },
    });
  },

  /**
   * 공간 통계 (호스트 전용)
   */
  getSpaceStatistics: async (spaceId: string): Promise<{
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(`/spaces/${spaceId}/statistics`);
    return response.data.data;
  },
};

export default spaceService;
