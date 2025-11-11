package com.project.anyplace.reservation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReservationCancelRequest {
    private String reason;
}