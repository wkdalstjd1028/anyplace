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

// ★ (JpaRepository<Reservation, String>인지 확인. ID 타입이 String)
public interface ReservationRepository extends JpaRepository<Reservation, String> {

    // ★ (1. 추가) getMyReservations 용
    Page<Reservation> findByUser(User user, Pageable pageable);
    Page<Reservation> findByUserAndStatus(User user, ReservationStatus status, Pageable pageable);

    // ★ (2. 추가) getHostReservations 용
    @Query("SELECT r FROM Reservation r WHERE r.space.hostId = :hostId")
    Page<Reservation> findBySpaceHostId(@Param("hostId") Long hostId, Pageable pageable);

    @Query("SELECT r FROM Reservation r WHERE r.space.hostId = :hostId AND r.status = :status")
    Page<Reservation> findBySpaceHostIdAndStatus(@Param("hostId") Long hostId, @Param("status") ReservationStatus status, Pageable pageable);

    // ★ (3. 추가) checkAvailability 용
    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
            "WHERE r.space.id = :spaceId " +
            "AND r.startDateTime < :endDateTime " +
            "AND r.endDateTime > :startDateTime " +
            // (수정) CANCELLED, REJECTED 상태가 아닌 예약만 확인
            "AND r.status <> com.project.anyplace.reservation.entity.ReservationStatus.CANCELLED " +
            "AND r.status <> com.project.anyplace.reservation.entity.ReservationStatus.REJECTED")
    boolean existsOverlappingReservation(@Param("spaceId") Long spaceId,
                                         @Param("startDateTime") LocalDateTime startDateTime,
                                         @Param("endDateTime") LocalDateTime endDateTime);
}