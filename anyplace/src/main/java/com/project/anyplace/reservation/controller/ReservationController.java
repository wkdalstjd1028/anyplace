// src/main/java/com/project/anyplace/reservation/controller/ReservationController.java
package com.project.anyplace.reservation.controller;

import com.project.anyplace.reservation.dto.CreateReservationRequest;
import com.project.anyplace.reservation.dto.ReservationResponse;
import com.project.anyplace.reservation.dto.UpdateReservationStatusRequest;
import com.project.anyplace.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    // 생성
    @PostMapping
    public ReservationResponse create(@RequestBody CreateReservationRequest req) {
        return reservationService.create(req);
    }

    // 조회: userId / hostId 중 하나로 필터
    @GetMapping
    public List<ReservationResponse> list(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String hostId
    ) {
        if (userId != null) return reservationService.listByUser(userId);
        if (hostId != null) return reservationService.listByHost(hostId);
        throw new IllegalArgumentException("either userId or hostId is required");
    }

    // 상태 변경(승인/거절/완료)
    @PatchMapping("/{id}/status")
    public ReservationResponse updateStatus(@PathVariable Long id,
                                            @RequestBody UpdateReservationStatusRequest req) {
        return reservationService.updateStatus(id, req);
    }

    // 취소(= CANCELLED)
    @DeleteMapping("/{id}")
    public ReservationResponse cancel(@PathVariable Long id) {
        return reservationService.cancel(id);
    }
}
