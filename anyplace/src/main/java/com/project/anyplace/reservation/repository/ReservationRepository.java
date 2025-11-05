package com.project.anyplace.reservation.repository;

import com.project.anyplace.reservation.entity.Reservation;
import com.project.anyplace.reservation.entity.ReservationStatus;
import com.project.anyplace.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

// Reservation ID는 String
public interface ReservationRepository extends JpaRepository<Reservation, String> {

    // User 엔티티(ID: Long)로 검색
    Page<Reservation> findByUser(User user, Pageable pageable);
    Page<Reservation> findByUserAndStatus(User user, ReservationStatus status, Pageable pageable);

    // Space의 hostId(Long)를 기준으로 검색 (수정된 메서드명)
    Page<Reservation> findBySpaceHostId(Long hostId, Pageable pageable);
    Page<Reservation> findBySpaceHostIdAndStatus(Long hostId, ReservationStatus status, Pageable pageable);

    /**
     * 핵심 로직: 겹치는 예약이 있는지 확인 (CANCELLED, REJECTED 제외)
     * (새 예약 시작 < 기존 예약 종료) AND (새 예약 종료 > 기존 예약 시작)
     */
    @Query("SELECT EXISTS (" +
            "SELECT 1 FROM Reservation r " +
            "WHERE r.space.id = :spaceId " + // space.id는 Long
            "AND r.status NOT IN ('CANCELLED', 'REJECTED') " +
            "AND r.startDateTime < :endDateTime " +
            "AND r.endDateTime > :startDateTime" +
            ")")
    boolean existsOverlappingReservation(
            @Param("spaceId") Long spaceId, // spaceId 파라미터는 Long
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );
}