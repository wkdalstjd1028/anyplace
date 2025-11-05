package com.project.anyplace.reservation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

// bookingService.ts의 cancelBooking(..., { reason })
@Getter
@NoArgsConstructor
public class ReservationCancelRequest {
    private String reason;
}