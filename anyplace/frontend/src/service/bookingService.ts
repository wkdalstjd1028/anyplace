import apiClient from '../lib/api';
// ... (import 생략) ...

const bookingService = {
  /**
   * 예약 생성
   */
  createBooking: async (data: BookingCreateRequest): Promise<Booking> => {
    // (수정) '/api' 추가
    const response = await apiClient.post<ApiResponse<Booking>>('/api/bookings', data);
    return response.data.data;
  },

  /**
   * 예약 상세 조회
   */
  getBookingById: async (bookingId: string): Promise<Booking> => {
    // (수정) '/api' 추가
    const response = await apiClient.get<ApiResponse<Booking>>(`/api/bookings/${bookingId}`);
    return response.data.data;
  },

  /**
   * 내 예약 목록 조회 (사용자)
   */
  getMyBookings: async (page = 0, size = 20, status?: BookingStatus): Promise<PaginatedResponse<Booking>> => {
    // (수정) '/api' 추가
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>('/api/bookings/my', {
      params: { /* ... */ },
    });
    return response.data.data;
  },

  /**
   * 호스트가 받은 예약 목록 (호스트 전용)
   */
  getHostBookings: async (page = 0, size = 20, status?: BookingStatus): Promise<PaginatedResponse<Booking>> => {
    // (수정) '/api' 추가
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>('/api/bookings/host', {
      params: { /* ... */ },
    });
    return response.data.data;
  },

  // ... (이하 모든 경로에도 '/api'를 추가해 주세요) ...

  /**
   * 특정 공간의 예약 목록 (호스트 전용)
   */
  getSpaceBookings: async (spaceId: string, page = 0, size = 20): Promise<PaginatedResponse<Booking>> => {
    // (수정) '/api' 추가
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(`/api/bookings/space/${spaceId}`, {
      /* ... */
    });
    return response.data.data;
  },

  /**
   * 예약 상태 변경 (호스트 전용 - 승인/거절)
   */
  updateBookingStatus: async (bookingId: string, data: BookingUpdateStatusRequest): Promise<Booking> => {
    // (수정) '/api' 추가
    const response = await apiClient.patch<ApiResponse<Booking>>(`/api/bookings/${bookingId}/status`, data);
    return response.data.data;
  },

  /**
   * 예약 취소 (사용자)
   */
  cancelBooking: async (bookingId: string, reason?: string): Promise<Booking> => {
    // (수정) '/api' 추가
    const response = await apiClient.patch<ApiResponse<Booking>>(`/api/bookings/${bookingId}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  /**
   * 예약 가능 여부 확인 (동시 예약 방지)
   */
  checkAvailability: async (data: BookingAvailabilityRequest): Promise<BookingAvailabilityResponse> => {
    // (수정) '/api' 추가
    const response = await apiClient.post<ApiResponse<BookingAvailabilityResponse>>('/api/bookings/check-availability', data);
    return response.data.data;
  },

  // ... (getUpcomingBookings, getRecentBookings, getBookingStatistics 등 모든 함수 수정) ...
};

export default bookingService;