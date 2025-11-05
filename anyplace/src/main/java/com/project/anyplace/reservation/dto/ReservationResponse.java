package com.project.anyplace.reservation.dto;

import com.project.anyplace.reservation.entity.Reservation;
import com.project.anyplace.reservation.entity.ReservationStatus;
import lombok.Getter;

@Getter
public class ReservationResponse {

    // ⭐️ 모든 필드에 'final' 추가
    private final String id;
    private final String userId;
    private final String userName;
    private final String userEmail;
    private final String spaceId;
    private final String spaceName;
    private final String spaceAddress;
    private final String hostId;
    private final String hostName;
    private final String checkInDate;
    private final String checkOutDate;
    private final String checkInTime;
    private final String checkOutTime;
    private final Integer guests;
    private final Long totalPrice;
    private final ReservationStatus status;
    private final String specialRequests;
    private final String createdAt;
    private final String updatedAt;

    public ReservationResponse(Reservation reservation) {
        this.id = reservation.getId();
        this.status = reservation.getStatus();
        this.guests = reservation.getGuests();
        this.totalPrice = reservation.getTotalPrice();
        this.specialRequests = reservation.getSpecialRequests();

        this.checkInDate = reservation.getStartDateTime().toLocalDate().toString();
        this.checkInTime = reservation.getStartDateTime().toLocalTime().toString();
        this.checkOutDate = reservation.getEndDateTime().toLocalDate().toString();
        this.checkOutTime = reservation.getEndDateTime().toLocalTime().toString();

        this.createdAt = reservation.getCreatedAt().toString();
        this.updatedAt = reservation.getUpdatedAt().toString();

        this.userId = String.valueOf(reservation.getUser().getId());
        this.userName = reservation.getUser().getName();
        this.userEmail = reservation.getUser().getEmail();

        this.spaceId = String.valueOf(reservation.getSpace().getId());
        this.spaceName = reservation.getSpace().getName();
        this.spaceAddress = reservation.getSpace().getAddress();

        this.hostId = String.valueOf(reservation.getSpace().getHostId());
        this.hostName = null; // (Service에서 조회 필요)
    }
}