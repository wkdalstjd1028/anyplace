package com.project.anyplace.reservation.dto;

import com.project.anyplace.reservation.entity.Reservation;
import com.project.anyplace.reservation.entity.ReservationStatus;
import lombok.Getter;
import lombok.Builder; // ★ (1. Builder 임포트)

import java.time.LocalDateTime; // ★ (2. LocalDateTime 임포트)

@Getter
@Builder // ★ (3. Builder 어노테이션 추가)
public class ReservationResponse {

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

    // ★ (4. Reservation 엔티티를 DTO로 변환하는 정적 팩토리 메서드 추가)
    public static ReservationResponse fromEntity(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .status(reservation.getStatus())
                .guests(reservation.getGuests())
                .totalPrice(reservation.getTotalPrice())
                .specialRequests(reservation.getSpecialRequests())

                .checkInDate(reservation.getStartDateTime().toLocalDate().toString())
                .checkInTime(reservation.getStartDateTime().toLocalTime().toString())
                .checkOutDate(reservation.getEndDateTime().toLocalDate().toString())
                .checkOutTime(reservation.getEndDateTime().toLocalTime().toString())

                .createdAt(reservation.getCreatedAt().toString())
                .updatedAt(reservation.getUpdatedAt().toString())

                .userId(String.valueOf(reservation.getUser().getId()))
                .userName(reservation.getUser().getName())
                .userEmail(reservation.getUser().getEmail())

                .spaceId(String.valueOf(reservation.getSpace().getId()))
                .spaceName(reservation.getSpace().getName())
                .spaceAddress(reservation.getSpace().getAddress())

                // ★ (수정) HostId는 Long 타입이지만, 편의상 HostName은 null 유지
                .hostId(String.valueOf(reservation.getSpace().getHostId()))
                .hostName(null)
                .build();
    }
}