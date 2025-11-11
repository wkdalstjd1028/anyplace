package com.project.anyplace.reservation.dto;

import com.project.anyplace.reservation.entity.ReservationStatus;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReservationUpdateStatusRequest {
    private ReservationStatus status;
    private String rejectionReason;
}