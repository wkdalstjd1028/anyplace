// src/service/paymentService.ts
import apiClient from '../lib/api';
import { 
  Payment, 
  PaymentCreateRequest, 
  PaymentApprovalRequest,
  PaymentCancelRequest,
  PaginatedResponse,
  ApiResponse 
} from '../lib/types';

const paymentService = {
  createPayment: async (data: PaymentCreateRequest): Promise<any> => {
    const response = await apiClient.post<any>('/api/payments', data);
    return response.data;
  },

  approvePayment: async (data: PaymentApprovalRequest): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/api/payments/approve', data);
    return response.data;
  },

  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/api/payments/${paymentId}`);
    return response.data;
  },

  getPaymentByBookingId: async (bookingId: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/api/payments/booking/${bookingId}`);
    return response.data;
  },

  getMyPayments: async (page = 0, size = 20): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<PaginatedResponse<Payment>>('/api/payments/my', {
      params: { page, size },
    });
    return response.data;
  },

  cancelPayment: async (paymentId: string, data: PaymentCancelRequest): Promise<Payment> => {
    const response = await apiClient.post<Payment>(`/api/payments/${paymentId}/cancel`, data);
    return response.data;
  },

  partialRefund: async (paymentId: string, amount: number, reason: string): Promise<Payment> => {
    const response = await apiClient.post<Payment>(`/api/payments/${paymentId}/refund`, {
      refundAmount: amount,
      reason,
    });
    return response.data;
  },

  handlePaymentFailure: async (paymentId: string, errorMessage: string): Promise<void> => {
    await apiClient.post(`/api/payments/${paymentId}/fail`, {
      errorMessage,
    });
  },

  getPaymentStatistics: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await apiClient.get<any>('/api/payments/statistics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  verifyPayment: async (transactionId: string, pgProvider: string): Promise<any> => {
    const response = await apiClient.post<any>('/api/payments/verify', {
      transactionId,
      pgProvider,
    });
    return response.data;
  },
  
  // (아래는 API 호출이 아니므로 수정 불필요)
  initializePortOnePayment: (bookingId: string, amount: number): any => { /* ... */ },
  initializeTossPayment: (bookingId: string, amount: number): any => { /* ... */ },

  checkPaymentAvailability: async (bookingId: string): Promise<any> => {
    const response = await apiClient.get<any>(`/api/payments/check/${bookingId}`);
    return response.data;
  },
};

export default paymentService;