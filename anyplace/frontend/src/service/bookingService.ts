import apiClient from '../lib/api';

const bookingService = {
  createBooking: async (data: BookingCreateRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>('/api/bookings', data);
    return response.data.data;
  },

  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(`/api/bookings/${bookingId}`);
    return response.data.data;
  },

  getMyBookings: async (page = 0, size = 20, status?: BookingStatus): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>('/api/bookings/my', {
      params: { /* ... */ },
    });
    return response.data.data;
  },

  getHostBookings: async (page = 0, size = 20, status?: BookingStatus): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>('/api/bookings/host', {
      params: { /* ... */ },
    });
    return response.data.data;
  },

  getSpaceBookings: async (spaceId: string, page = 0, size = 20): Promise<PaginatedResponse<Booking>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Booking>>>(`/api/bookings/space/${spaceId}`, {
    });
    return response.data.data;
  },

  updateBookingStatus: async (bookingId: string, data: BookingUpdateStatusRequest): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/api/bookings/${bookingId}/status`, data);
    return response.data.data;
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.patch<ApiResponse<Booking>>(`/api/bookings/${bookingId}/cancel`, {
      reason,
    });
    return response.data.data;
  },

  checkAvailability: async (data: BookingAvailabilityRequest): Promise<BookingAvailabilityResponse> => {
    const response = await apiClient.post<ApiResponse<BookingAvailabilityResponse>>('/api/bookings/check-availability', data);
    return response.data.data;
  },

};

export default bookingService;