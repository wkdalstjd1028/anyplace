package com.project.anyplace.reservation.entity;

// types.ts의 BookingStatus
public enum ReservationStatus {
    PENDING,    // 대기중
    CONFIRMED,  // 확정
    REJECTED,   // 거절
    CANCELLED,  // 취소
    COMPLETED   // 완료
}