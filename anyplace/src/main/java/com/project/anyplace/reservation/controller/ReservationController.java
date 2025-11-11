package com.project.anyplace.reservation.controller;

import com.project.anyplace.reservation.dto.*;
import com.project.anyplace.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings") // React가 요청하는 URL
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;


    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @RequestBody ReservationCreateRequest requestDto
    ) {
        String currentUserId = "1";
        ReservationResponse response = reservationService.createReservation(requestDto, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getMyReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        String currentUserId = "1";
        Page<ReservationResponse> response = reservationService.getMyReservations(currentUserId, page, size, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservationById(@PathVariable String bookingId) {
        ReservationResponse response = reservationService.getReservationById(bookingId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @PathVariable String bookingId,
            @RequestBody ReservationCancelRequest requestDto
    ) {
        String currentUserId = "1"; // (임시 ID)
        ReservationResponse response = reservationService.cancelReservation(bookingId, currentUserId, requestDto.getReason());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/check-availability")
    public ResponseEntity<ApiResponse<ReservationAvailabilityResponse>> checkAvailability(
            @RequestBody ReservationAvailabilityRequest requestDto
    ) {
        ReservationAvailabilityResponse response = reservationService.checkAvailability(requestDto);
        return ResponseEntity.ok(ApiResponse.success(response));
    }


    @GetMapping("/host")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getHostReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        String currentHostId = "2";
        Page<ReservationResponse> response = reservationService.getHostReservations(currentHostId, page, size, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservationStatus(
            @PathVariable String bookingId,
            @RequestBody ReservationUpdateStatusRequest requestDto
    ) {
        String currentHostId = "2";
        ReservationResponse response = reservationService.updateReservationStatus(bookingId, currentHostId, requestDto);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}