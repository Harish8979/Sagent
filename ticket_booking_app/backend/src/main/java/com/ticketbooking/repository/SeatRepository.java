package com.ticketbooking.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticketbooking.entity.Seat;
import com.ticketbooking.entity.SeatStatus;

import jakarta.persistence.LockModeType;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByShowtimeIdOrderBySeatRowAscSeatNumberAsc(Long showtimeId);

    List<Seat> findBySelectedBySessionIdAndStatus(String selectedBySessionId, SeatStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Seat s where s.showtime.id = :showtimeId and s.id in :seatIds")
    List<Seat> findAllByShowtimeIdAndIdInForUpdate(@Param("showtimeId") Long showtimeId, @Param("seatIds") Collection<Long> seatIds);
}
