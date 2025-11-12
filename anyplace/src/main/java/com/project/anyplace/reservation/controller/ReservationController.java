package com.project.anyplace.reservation.controller;

import com.project.anyplace.reservation.dto.*;
import com.project.anyplace.reservation.service.ReservationService;
import com.project.anyplace.user.repository.UserRepository; // ★ (1. UserRepository 임포트)
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // ★ (2. AuthenticationPrincipal 임포트)
import org.springframework.security.oauth2.core.oidc.user.OidcUser; // (OidcUser 임포트)
import org.springframework.security.oauth2.core.user.OAuth2User; // ★ (3. OAuth2User 임포트)
import org.springframework.web.bind.annotation.*;

import java.util.Map; // (Map 임포트)
import jakarta.validation.Valid; // (Valid 임포트)

@RestController
@RequestMapping("/api/bookings") // ★ (4. URL 수정: /bookings -> /api/bookings)
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository; // ★ (5. UserRepository 주입)

    // ★ (6. User ID 헬퍼 메서드 추가 - UserController와 동일)
    private Long getUserIdFromPrincipal(OAuth2User oauth2User) {
        if (oauth2User == null) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }

        Map<String, Object> attributes = oauth2User.getAttributes();
        String provider;
        String providerId;

        if (oauth2User instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) oauth2User;
            provider = getProviderFromIssuer(oidcUser.getIssuer().toString());
            providerId = oidcUser.getSubject();
        } else {
            if (attributes.containsKey("kakao_account")) {
                provider = "kakao";
                providerId = String.valueOf(attributes.get("id"));
            } else if (attributes.containsKey("response")) {
                provider = "naver";
                providerId = (String) ((Map<String, Object>) attributes.get("response")).get("id");
            } else {
                throw new RuntimeException("알 수 없는 OAuth2 provider입니다.");
            }
        }
        return userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseThrow(() -> new RuntimeException("DB에서 사용자를 찾을 수 없습니다. provider=" + provider + ", providerId=" + providerId))
                .getId();
    }
    private String getProviderFromIssuer(String issuer) {
        if (issuer.contains("google")) { return "google"; }
        return "google";
    }

    // 예약 생성 (게스트)
    @PostMapping
    public ResponseEntity<ApiResponse<ReservationResponse>> createReservation(
            @AuthenticationPrincipal OAuth2User oauth2User, // ★ (7. 인증 주체 받기)
            @Valid @RequestBody ReservationCreateRequest requestDto
    ) {
        Long currentUserId = getUserIdFromPrincipal(oauth2User); // ★ (8. 실제 ID 사용)
        ReservationResponse response = reservationService.createReservation(requestDto, String.valueOf(currentUserId));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    // 내 예약 목록 조회 (게스트)
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getMyReservations(
            @AuthenticationPrincipal OAuth2User oauth2User, // ★ (9. 인증 주체 받기)
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        Long currentUserId = getUserIdFromPrincipal(oauth2User); // ★ (10. 실제 ID 사용)
        Page<ReservationResponse> response = reservationService.getMyReservations(String.valueOf(currentUserId), page, size, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<ReservationResponse>> getReservationById(@PathVariable String bookingId) {
        ReservationResponse response = reservationService.getReservationById(bookingId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 예약 취소 (게스트)
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<ReservationResponse>> cancelReservation(
            @AuthenticationPrincipal OAuth2User oauth2User, // ★ (11. 인증 주체 받기)
            @PathVariable String bookingId,
            @RequestBody ReservationCancelRequest requestDto
    ) {
        Long currentUserId = getUserIdFromPrincipal(oauth2User); // ★ (12. 실제 ID 사용)
        ReservationResponse response = reservationService.cancelReservation(bookingId, String.valueOf(currentUserId), requestDto.getReason());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/check-availability")
    public ResponseEntity<ApiResponse<ReservationAvailabilityResponse>> checkAvailability(
            @RequestBody ReservationAvailabilityRequest requestDto
    ) {
        ReservationAvailabilityResponse response = reservationService.checkAvailability(requestDto);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 호스트 예약 목록 조회 (호스트)
    @GetMapping("/host")
    public ResponseEntity<ApiResponse<Page<ReservationResponse>>> getHostReservations(
            @AuthenticationPrincipal OAuth2User oauth2User, // ★ (13. 인증 주체 받기)
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        Long currentHostId = getUserIdFromPrincipal(oauth2User); // ★ (14. 실제 ID 사용)
        Page<ReservationResponse> response = reservationService.getHostReservations(String.valueOf(currentHostId), page, size, status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 예약 상태 변경 (호스트)
    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<ApiResponse<ReservationResponse>> updateReservationStatus(
            @AuthenticationPrincipal OAuth2User oauth2User, // ★ (15. 인증 주체 받기)
            @PathVariable String bookingId,
            @Valid @RequestBody ReservationUpdateStatusRequest requestDto
    ) {
        Long currentHostId = getUserIdFromPrincipal(oauth2User); // ★ (16. 실제 ID 사용)
        ReservationResponse response = reservationService.updateReservationStatus(bookingId, String.valueOf(currentHostId), requestDto);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}