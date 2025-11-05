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

    // ⭐️ (수정) 모든 반환 타입을 ApiResponse<T>로 감쌉니다.

    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @RequestBody ReservationCreateRequest requestDto
            // TODO: @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String currentUserId = "1"; // (임시 ID, 실제로는 String 타입 UUID)
        ReservationResponse response = reservationService.createReservation(requestDto, currentUserId);
        // ⭐️ (수정) ApiResponse.success()로 감싸기
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getMyReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
            // TODO: @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String currentUserId = "1"; // (임시 ID)
        Page<ReservationResponse> response = reservationService.getMyReservations(currentUserId, page, size, status);
        // ⭐️ (수정) ApiResponse.success()로 감싸기
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservationById(@PathVariable String bookingId) {
        ReservationResponse response = reservationService.getReservationById(bookingId);
        // ⭐️ (수정) ApiResponse.success()로 감싸기
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @PathVariable String bookingId,
            @RequestBody ReservationCancelRequest requestDto
            // TODO: @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String currentUserId = "1"; // (임시 ID)
        ReservationResponse response = reservationService.cancelReservation(bookingId, currentUserId, requestDto.getReason());
        // ⭐️ (수정) ApiResponse.success()로 감싸기
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/check-availability")
    public ResponseEntity<ApiResponse<ReservationAvailabilityResponse>> checkAvailability(
            @RequestBody ReservationAvailabilityRequest requestDto
    ) {
        ReservationAvailabilityResponse response = reservationService.checkAvailability(requestDto);
        // ⭐️ (수정) ApiResponse.success()로 감싸기
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- 호스트 기능 ---

    @GetMapping("/host")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getHostReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
            // TODO: @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String currentHostId = "2"; // (임시 호스트 ID, Space의 hostId가 2라고 가정)
        Page<ReservationResponse> response = reservationService.getHostReservations(currentHostId, page, size, status);
        // ⭐️ (수정) ApiResponse.success()로 감싸기
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservationStatus(
            @PathVariable String bookingId,
            @RequestBody ReservationUpdateStatusRequest requestDto
            // TODO: @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String currentHostId = "2"; // (임시 호스트 ID)
        ReservationResponse response = reservationService.updateReservationStatus(bookingId, currentHostId, requestDto);
        // ⭐️ (수정) ApiResponse.success()로 감싸기
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}