import apiClient from '../lib/api';
import { 
  Wishlist,
  Space,
  PaginatedResponse,
  ApiResponse 
} from '../lib/types';

/**
 * 위시리스트(찜하기) 관련 API 서비스
 */
const wishlistService = {
  /**
   * 위시리스트에 추가
   */
  addToWishlist: async (spaceId: string): Promise<Wishlist> => {
    const response = await apiClient.post<ApiResponse<Wishlist>>('/wishlist', {
      spaceId,
    });
    return response.data.data;
  },

  /**
   * 위시리스트에서 제거
   */
  removeFromWishlist: async (spaceId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${spaceId}`);
  },

  /**
   * 위시리스트 목록 조회
   */
  getMyWishlist: async (page = 0, size = 20): Promise<PaginatedResponse<Wishlist>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Wishlist>>>('/wishlist', {
      params: {
        page,
        size,
      },
    });
    return response.data.data;
  },

  /**
   * 특정 공간이 위시리스트에 있는지 확인
   */
  isInWishlist: async (spaceId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get<ApiResponse<{ inWishlist: boolean }>>(`/wishlist/check/${spaceId}`);
      return response.data.data.inWishlist;
    } catch {
      return false;
    }
  },

  /**
   * 위시리스트 토글 (추가/제거)
   */
  toggleWishlist: async (spaceId: string): Promise<{ added: boolean }> => {
    const response = await apiClient.post<ApiResponse<{ added: boolean }>>(`/wishlist/toggle`, {
      spaceId,
    });
    return response.data.data;
  },

  /**
   * 위시리스트 전체 삭제
   */
  clearWishlist: async (): Promise<void> => {
    await apiClient.delete('/wishlist/clear');
  },

  /**
   * 위시리스트 개수 조회
   */
  getWishlistCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/wishlist/count');
    return response.data.data.count;
  },

  /**
   * 위시리스트 공간들의 ID 배열 조회 (빠른 체크용)
   */
  getWishlistSpaceIds: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/wishlist/space-ids');
    return response.data.data;
  },
};

export default wishlistService;
