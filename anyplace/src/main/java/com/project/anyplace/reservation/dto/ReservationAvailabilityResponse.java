package com.project.anyplace.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// types.ts의 BookingAvailabilityResponse
@Getter
@AllArgsConstructor
public class ReservationAvailabilityResponse {
    private boolean available;
    private String message;
}