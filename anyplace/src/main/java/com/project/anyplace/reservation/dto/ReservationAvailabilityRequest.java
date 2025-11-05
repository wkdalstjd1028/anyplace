package com.project.anyplace.reservation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

// types.ts의 BookingAvailabilityRequest
@Getter
@NoArgsConstructor
public class ReservationAvailabilityRequest {
    private String spaceId;
    private String checkInDate;
    private String checkOutDate;
    private String checkInTime;
    private String checkOutTime;
}