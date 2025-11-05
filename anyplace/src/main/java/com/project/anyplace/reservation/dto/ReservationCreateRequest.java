package com.project.anyplace.reservation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

// types.ts의 BookingCreateRequest
@Getter
@NoArgsConstructor
public class ReservationCreateRequest {
    private String spaceId;
    private String checkInDate;  // "YYYY-MM-DD"
    private String checkOutDate; // "YYYY-MM-DD"
    private String checkInTime;  // "HH:MM"
    private String checkOutTime; // "HH:MM"
    private Integer guests;
    private String specialRequests;
}