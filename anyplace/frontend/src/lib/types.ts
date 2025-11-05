// ============================================
// 공통 타입
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ============================================
// 사용자 관련 타입
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  provider: 'GOOGLE' | 'KAKAO' | 'NAVER';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  provider: 'GOOGLE' | 'KAKAO' | 'NAVER';
  code: string;
  redirectUri: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// 공간 관련 타입
// ============================================

export type SpaceType = 'PARTY_ROOM' | 'MEETING_ROOM' | 'RECORDING_STUDIO' | 'PRACTICE_ROOM' | 'SEMINAR_ROOM' | 'OTHER';

export interface Space {
  id: string;
  hostId: string;
  hostName: string;
  name: string;
  description: string;
  type: SpaceType;
  address: string;
  city: string; // 시/도
  district: string; // 구/군/시
  detailAddress: string;
  maxCapacity: number;
  pricePerHour: number;
  images: string[];
  amenities: string[];
  rules: string[];
  availableFrom: string; // 시작 가능 시간 (HH:mm)
  availableTo: string; // 종료 시간 (HH:mm)
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpaceCreateRequest {
  name: string;
  description: string;
  type: SpaceType;
  address: string;
  city: string;
  district: string;
  detailAddress: string;
  maxCapacity: number;
  pricePerHour: number;
  images: string[];
  amenities: string[];
  rules: string[];
  availableFrom: string;
  availableTo: string;
}

export interface SpaceUpdateRequest extends Partial<SpaceCreateRequest> {
  isActive?: boolean;
}

export interface SpaceSearchParams {
  keyword?: string;
  city?: string;
  district?: string;
  type?: SpaceType;
  checkInDate?: string; // yyyy-MM-dd
  checkOutDate?: string; // yyyy-MM-dd
  minCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string; // 예: "price,asc" or "rating,desc"
}

// ============================================
// 예약 관련 타입
// ============================================

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  spaceId: string;
  spaceName: string;
  spaceType: SpaceType;
  spaceAddress: string;
  hostId: string;
  hostName: string;
  checkInDate: string; // yyyy-MM-dd
  checkOutDate: string; // yyyy-MM-dd
  checkInTime: string; // HH:mm
  checkOutTime: string; // HH:mm
  guests: number;
  totalPrice: number;
  status: BookingStatus;
  paymentId?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateRequest {
  spaceId: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  guests: number;
  specialRequests?: string;
}

export interface BookingUpdateStatusRequest {
  status: BookingStatus;
  rejectionReason?: string;
}

export interface BookingAvailabilityRequest {
  spaceId: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
}

export interface BookingAvailabilityResponse {
  available: boolean;
  message?: string;
}

// ============================================
// 결제 관련 타입
// ============================================

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'CARD' | 'VIRTUAL_ACCOUNT' | 'TRANSFER' | 'MOBILE';

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: 'PORTONE' | 'TOSSPAYMENTS'; // 결제 PG사
  transactionId?: string; // PG사 거래 ID
  approvedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCreateRequest {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  provider: 'PORTONE' | 'TOSSPAYMENTS';
  successUrl: string;
  failUrl: string;
}

export interface PaymentApprovalRequest {
  paymentId: string;
  transactionId: string;
  pgProvider: string;
}

export interface PaymentCancelRequest {
  reason: string;
  refundAmount?: number;
}

// ============================================
// 리뷰 관련 타입
// ============================================

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userProfileImage?: string;
  spaceId: string;
  bookingId: string;
  rating: number;
  comment: string;
  images: string[];
  hostReply?: string;
  hostRepliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewCreateRequest {
  bookingId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface ReviewReplyRequest {
  reply: string;
}

// ============================================
// 위시리스트 관련 타입
// ============================================

export interface Wishlist {
  id: string;
  userId: string;
  spaceId: string;
  space: Space;
  createdAt: string;
}

// ============================================
// 에러 타입
// ============================================

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
