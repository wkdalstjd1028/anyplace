package com.project.anyplace.reservation.dto;

import com.project.anyplace.reservation.entity.ReservationStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

// types.ts의 BookingUpdateStatusRequest
@Getter
@NoArgsConstructor
public class ReservationUpdateStatusRequest {
    private ReservationStatus status; // Enum으로 바로 받음
    private String rejectionReason;
}