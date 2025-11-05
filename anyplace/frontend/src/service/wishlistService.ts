// src/service/wishlistService.ts
import apiClient from '../lib/api';
import { 
  Wishlist,
  Space,
  PaginatedResponse,
  ApiResponse 
} from '../lib/types';

const wishlistService = {
  addToWishlist: async (spaceId: string): Promise<Wishlist> => {
    const response = await apiClient.post<Wishlist>('/api/wishlist', {
      spaceId,
    });
    return response.data;
  },

  removeFromWishlist: async (spaceId: string): Promise<void> => {
    await apiClient.delete(`/api/wishlist/${spaceId}`);
  },

  getMyWishlist: async (page = 0, size = 20): Promise<PaginatedResponse<Wishlist>> => {
    const response = await apiClient.get<PaginatedResponse<Wishlist>>('/api/wishlist', {
      params: { page, size },
    });
    return response.data;
  },

  isInWishlist: async (spaceId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<{ inWishlist: boolean }>(`/api/wishlist/check/${spaceId}`);
      return response.data.inWishlist;
    } catch {
      return false;
    }
  },

  toggleWishlist: async (spaceId: string): Promise<{ added: boolean }> => {
    const response = await apiClient.post<{ added: boolean }>(`/api/wishlist/toggle`, {
      spaceId,
    });
    return response.data;
  },

  clearWishlist: async (): Promise<void> => {
    await apiClient.delete('/api/wishlist/clear');
  },

  getWishlistCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/api/wishlist/count');
    return response.data.count;
  },

  getWishlistSpaceIds: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/wishlist/space-ids');
    return response.data;
  },
};

export default wishlistService;