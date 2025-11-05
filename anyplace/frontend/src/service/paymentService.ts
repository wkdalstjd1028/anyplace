import apiClient from '../lib/api';
import { 
  Payment, 
  PaymentCreateRequest, 
  PaymentApprovalRequest,
  PaymentCancelRequest,
  PaginatedResponse,
  ApiResponse 
} from '../lib/types';

/**
 * 결제 관련 API 서비스
 */
const paymentService = {
  /**
   * 결제 생성 (결제 요청)
   */
  createPayment: async (data: PaymentCreateRequest): Promise<{
    payment: Payment;
    checkoutUrl: string; // PG사 결제 페이지 URL
  }> => {
    const response = await apiClient.post<ApiResponse<any>>('/payments', data);
    return response.data.data;
  },

  /**
   * 결제 승인 (PG사 콜백 후 검증)
   */
  approvePayment: async (data: PaymentApprovalRequest): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments/approve', data);
    return response.data.data;
  },

  /**
   * 결제 조회
   */
  getPaymentById: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
    return response.data.data;
  },

  /**
   * 예약별 결제 조회
   */
  getPaymentByBookingId: async (bookingId: string): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/booking/${bookingId}`);
    return response.data.data;
  },

  /**
   * 내 결제 내역 목록
   */
  getMyPayments: async (page = 0, size = 20): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Payment>>>('/payments/my', {
      params: {
        page,
        size,
      },
    });
    return response.data.data;
  },

  /**
   * 결제 취소 (환불)
   */
  cancelPayment: async (paymentId: string, data: PaymentCancelRequest): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/cancel`, data);
    return response.data.data;
  },

  /**
   * 부분 환불
   */
  partialRefund: async (paymentId: string, amount: number, reason: string): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${paymentId}/refund`, {
      refundAmount: amount,
      reason,
    });
    return response.data.data;
  },

  /**
   * 결제 실패 처리
   */
  handlePaymentFailure: async (paymentId: string, errorMessage: string): Promise<void> => {
    await apiClient.post(`/payments/${paymentId}/fail`, {
      errorMessage,
    });
  },

  /**
   * 결제 통계 (호스트 전용)
   */
  getPaymentStatistics: async (startDate?: string, endDate?: string): Promise<{
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/payments/statistics', {
      params: {
        startDate,
        endDate,
      },
    });
    return response.data.data;
  },

  /**
   * PG사 웹훅 검증 (백엔드에서 처리하지만, 프론트에서 상태 확인용)
   */
  verifyPayment: async (transactionId: string, pgProvider: string): Promise<{
    verified: boolean;
    payment: Payment;
  }> => {
    const response = await apiClient.post<ApiResponse<any>>('/payments/verify', {
      transactionId,
      pgProvider,
    });
    return response.data.data;
  },

  /**
   * 포트원(PortOne) 결제 초기화 (클라이언트 SDK용 데이터)
   */
  initializePortOnePayment: (bookingId: string, amount: number): {
    merchantUid: string;
    name: string;
    amount: number;
    buyerEmail?: string;
    buyerName?: string;
  } => {
    // 고유한 주문번호 생성
    const merchantUid = `booking_${bookingId}_${Date.now()}`;
    
    return {
      merchantUid,
      name: `Anyplace 공간 예약`,
      amount,
    };
  },

  /**
   * 토스페이먼츠 결제 초기화
   */
  initializeTossPayment: (bookingId: string, amount: number): {
    orderId: string;
    orderName: string;
    amount: number;
    customerName?: string;
    customerEmail?: string;
  } => {
    // 고유한 주문번호 생성
    const orderId = `booking_${bookingId}_${Date.now()}`;
    
    return {
      orderId,
      orderName: `Anyplace 공간 예약`,
      amount,
    };
  },

  /**
   * 결제 가능 여부 확인
   */
  checkPaymentAvailability: async (bookingId: string): Promise<{
    canPay: boolean;
    reason?: string;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>(`/payments/check/${bookingId}`);
    return response.data.data;
  },
};

export default paymentService;
