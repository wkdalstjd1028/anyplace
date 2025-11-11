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

public interface ReservationRepository extends JpaRepository<Reservation, String> {

    Page<Reservation> findByUser(User user, Pageable pageable);
    Page<Reservation> findByUserAndStatus(User user, ReservationStatus status, Pageable pageable);

    Page<Reservation> findBySpaceHostId(Long hostId, Pageable pageable);
    Page<Reservation> findBySpaceHostIdAndStatus(Long hostId, ReservationStatus status, Pageable pageable);

    @Query("SELECT EXISTS (" +
            "SELECT 1 FROM Reservation r " +
            "WHERE r.space.id = :spaceId " + // space.id는 Long
            "AND r.status NOT IN ('CANCELLED', 'REJECTED') " +
            "AND r.startDateTime < :endDateTime " +
            "AND r.endDateTime > :startDateTime" +
            ")")
    boolean existsOverlappingReservation(
            @Param("spaceId") Long spaceId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );
}