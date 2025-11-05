import apiClient from '../lib/api';
import { 
  Booking, 
  BookingCreateRequest, 
  BookingUpdateStatusRequest,
  BookingAvailabilityRequest,
  BookingAvailabilityResponse,
  PaginatedResponse,
  ApiResponse,
  BookingStatus
} from '../lib/types';

/**
 * 예약 관련 API 서비스
 */
const bookingService = {
  /**
   * 예약 생성
   */
  createBooking: async (data: BookingCreateRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>('/bookings', data);
    return response.data.data;
  },

  /**
   * 예약 상세 조회
   */
  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}`);
    return response.data.data;
  },

  /**
   * 내 예약 목록 조회 (사용자)
   */
  getMyBookings: async (page = 0, size = 20, status?: BookingStatus): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings/my', {
      params: {
        page,
        size,
        status,
      },
    });
    return response.data.data;
  },

  /**
   * 호스트가 받은 예약 목록 (호스트 전용)
   */
  getHostBookings: async (page = 0, size = 20, status?: BookingStatus): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings/host', {
      params: {
        page,
        size,
        status,
      },
    });
    return response.data.data;
  },

  /**
   * 특정 공간의 예약 목록 (호스트 전용)
   */
  getSpaceBookings: async (spaceId: string, page = 0, size = 20): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(`/bookings/space/${spaceId}`, {
      params: {
        page,
        size,
      },
    });
    return response.data.data;
  },

  /**
   * 예약 상태 변경 (호스트 전용 - 승인/거절)
   */
  updateBookingStatus: async (bookingId: string, data: BookingUpdateStatusRequest): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/status`, data);
    return response.data.data;
  },

  /**
   * 예약 취소 (사용자)
   */
  cancelBooking: async (bookingId: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  /**
   * 예약 가능 여부 확인 (동시 예약 방지)
   */
  checkAvailability: async (data: BookingAvailabilityRequest): Promise<BookingAvailabilityResponse> => {
    const response = await apiClient.post<ApiResponse<BookingAvailabilityResponse>>('/bookings/check-availability', data);
    return response.data.data;
  },

  /**
   * 예약 승인 (호스트 전용)
   */
  approveBooking: async (bookingId: string): Promise<Booking> => {
    return bookingService.updateBookingStatus(bookingId, { status: 'CONFIRMED' });
  },

  /**
   * 예약 거절 (호스트 전용)
   */
  rejectBooking: async (bookingId: string, rejectionReason: string): Promise<Booking> => {
    return bookingService.updateBookingStatus(bookingId, { 
      status: 'REJECTED',
      rejectionReason,
    });
  },

  /**
   * 예약 완료 처리 (자동 또는 수동)
   */
  completeBooking: async (bookingId: string): Promise<Booking> => {
    return bookingService.updateBookingStatus(bookingId, { status: 'COMPLETED' });
  },

  /**
   * 다가오는 예약 목록
   */
  getUpcomingBookings: async (limit = 5): Promise<Booking[]> => {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/bookings/upcoming', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * 최근 예약 목록
   */
  getRecentBookings: async (limit = 10): Promise<Booking[]> => {
    const response = await apiClient.get<ApiResponse<Booking[]>>('/bookings/recent', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * 예약 통계 조회 (호스트 전용)
   */
  getBookingStatistics: async (startDate?: string, endDate?: string): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/bookings/statistics', {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data.data;
  },

  /**
   * 특정 날짜의 예약 가능 시간대 조회
   */
  getAvailableTimeSlots: async (spaceId: string, date: string): Promise<{
    availableSlots: Array<{ startTime: string; endTime: string }>;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(`/bookings/available-slots/${spaceId}`, {
      params: { date },
    });
    return response.data.data;
  },

  /**
   * 예약 수정 (날짜/시간 변경) - 향후 구현 예정
   */
  updateBooking: async (bookingId: string, data: Partial<BookingCreateRequest>): Promise<Booking> => {
    const response = await apiClient.put<ApiResponse<Booking>>(`/bookings/${bookingId}`, data);
    return response.data.data;
  },
};

export default bookingService;
