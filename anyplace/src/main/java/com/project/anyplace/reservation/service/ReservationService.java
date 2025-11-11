package com.project.anyplace.reservation.service;

import com.project.anyplace.reservation.dto.*;
import com.project.anyplace.reservation.entity.Reservation;
import com.project.anyplace.reservation.entity.ReservationStatus;
import com.project.anyplace.reservation.repository.ReservationRepository;
import com.project.anyplace.space.entity.Space;
import com.project.anyplace.space.repository.SpaceRepository;
import com.project.anyplace.user.entity.User;
import com.project.anyplace.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final SpaceRepository spaceRepository;

    @Transactional
    public ReservationResponse createReservation(ReservationCreateRequest dto, String userId) {
        User user = findUserById(Long.parseLong(userId));
        Space space = findSpaceById(Long.parseLong(dto.getSpaceId()));

        LocalDateTime startDateTime = parseDateTime(dto.getCheckInDate(), dto.getCheckInTime());
        LocalDateTime endDateTime = parseDateTime(dto.getCheckOutDate(), dto.getCheckOutTime());

        boolean isOverlapping = reservationRepository.existsOverlappingReservation(
                space.getId(), startDateTime, endDateTime
        );
        if (isOverlapping) {
            throw new IllegalStateException("해당 시간에 이미 예약이 존재합니다.");
        }

        long hours = ChronoUnit.HOURS.between(startDateTime, endDateTime);
        if (hours <= 0) {
            throw new IllegalArgumentException("예약 종료 시간은 시작 시간보다 이후여야 합니다.");
        }
        long totalPrice = hours * space.getPricePerHour();

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setSpace(space);
        reservation.setStartDateTime(startDateTime);
        reservation.setEndDateTime(endDateTime);
        reservation.setGuests(dto.getGuests());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setSpecialRequests(dto.getSpecialRequests());

        Reservation savedReservation = reservationRepository.saveAndFlush(reservation);

        return new ReservationResponse(savedReservation);
    }

    public Page<ReservationResponse> getMyReservations(String userId, int page, int size, String status) {
        User user = findUserById(Long.parseLong(userId));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Reservation> reservationPage;
        if (status != null && !status.isEmpty()) {
            reservationPage = reservationRepository.findByUserAndStatus(user, ReservationStatus.valueOf(status), pageable);
        } else {
            reservationPage = reservationRepository.findByUser(user, pageable);
        }

        return reservationPage.map(ReservationResponse::new);
    }

    public ReservationResponse getReservationById(String reservationId) {
        Reservation reservation = findReservationById(reservationId);
        return new ReservationResponse(reservation);
    }

    @Transactional
    public ReservationResponse cancelReservation(String reservationId, String userId, String reason) {
        Reservation reservation = findReservationById(reservationId);
        Long userLongId = Long.parseLong(userId);

        if (!reservation.getUser().getId().equals(userLongId)) {
            throw new SecurityException("예약을 취소할 권한이 없습니다.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        return new ReservationResponse(reservation);
    }

    public ReservationAvailabilityResponse checkAvailability(ReservationAvailabilityRequest dto) {
        LocalDateTime startDateTime = parseDateTime(dto.getCheckInDate(), dto.getCheckInTime());
        LocalDateTime endDateTime = parseDateTime(dto.getCheckOutDate(), dto.getCheckOutTime());
        Long spaceLongId = Long.parseLong(dto.getSpaceId());

        boolean isOverlapping = reservationRepository.existsOverlappingReservation(
                spaceLongId, startDateTime, endDateTime
        );

        if (isOverlapping) {
            return new ReservationAvailabilityResponse(false, "해당 시간대는 예약이 불가능합니다.");
        } else {
            return new ReservationAvailabilityResponse(true, "예약 가능한 시간대입니다.");
        }
    }

    public Page<ReservationResponse> getHostReservations(String hostId, int page, int size, String status) {
        Long hostLongId = Long.parseLong(hostId);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Reservation> reservationPage;
        if (status != null && !status.isEmpty()) {
            reservationPage = reservationRepository.findBySpaceHostIdAndStatus(hostLongId, ReservationStatus.valueOf(status), pageable);
        } else {
            reservationPage = reservationRepository.findBySpaceHostId(hostLongId, pageable);
        }

        return reservationPage.map(ReservationResponse::new);
    }

    @Transactional
    public ReservationResponse updateReservationStatus(String reservationId, String hostId, ReservationUpdateStatusRequest dto) {
        Reservation reservation = findReservationById(reservationId);
        Long hostLongId = Long.parseLong(hostId);

        if (!reservation.getSpace().getHostId().equals(hostLongId)) {
            throw new SecurityException("예약 상태를 변경할 권한이 없습니다.");
        }

        reservation.setStatus(dto.getStatus());
        return new ReservationResponse(reservation);
    }


    private LocalDateTime parseDateTime(String date, String time) {
        return LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time));
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));
    }

    private Space findSpaceById(Long spaceId) {
        return spaceRepository.findById(spaceId)
                .orElseThrow(() -> new IllegalArgumentException("공간을 찾을 수 없습니다: " + spaceId));
    }

    private Reservation findReservationById(String reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("예약을 찾을 수 없습니다: " + reservationId));
    }
}