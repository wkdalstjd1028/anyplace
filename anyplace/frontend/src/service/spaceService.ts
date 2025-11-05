import apiClient from '../lib/api';
import {
  Space,
  SpaceCreateRequest,
  SpaceUpdateRequest,
  SpaceSearchParams,
  PaginatedResponse,
  ApiResponse
} from '../lib/types';

const spaceService = {
  searchSpaces: async (params: SpaceSearchParams = {}): Promise<PaginatedResponse<Space>> => {
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

    return response.data;
  },

  getSpaceById: async (spaceId: string): Promise<Space> => {
    const response = await apiClient.get<Space>(`/api/spaces/${spaceId}`);
    return response.data;
  },

  createSpace: async (data: SpaceCreateRequest): Promise<Space> => {
    const response = await apiClient.post<Space>('/api/spaces', data);
    return response.data;
  },

  updateSpace: async (spaceId: string, data: SpaceUpdateRequest): Promise<Space> => {
    const response = await apiClient.put<Space>(`/api/spaces/${spaceId}`, data);
    return response.data;
  },

  deleteSpace: async (spaceId: string): Promise<void> => {
    await apiClient.delete(`/api/spaces/${spaceId}`);
  },


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