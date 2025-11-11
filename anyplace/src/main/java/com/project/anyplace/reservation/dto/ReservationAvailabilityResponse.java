package com.project.anyplace.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReservationAvailabilityResponse {
    private boolean available;
    private String message;
}