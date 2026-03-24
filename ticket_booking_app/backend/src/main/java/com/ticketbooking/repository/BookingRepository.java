package com.ticketbooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.entity.Booking;
import com.ticketbooking.entity.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"showtime", "showtime.movie", "showtime.theater", "seats"})
    List<Booking> findByUserAccountIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"showtime", "showtime.movie", "showtime.theater", "seats", "userAccount"})
    Optional<Booking> findByIdAndUserAccountId(Long bookingId, Long userId);

    @EntityGraph(attributePaths = {"showtime", "showtime.movie", "showtime.theater", "seats", "userAccount"})
    List<Booking> findByShowtimeIdAndBookingStatus(Long showtimeId, BookingStatus bookingStatus);

    @EntityGraph(attributePaths = {"showtime", "showtime.movie", "showtime.theater", "seats", "userAccount"})
    List<Booking> findAllByOrderByCreatedAtDesc();

    boolean existsByUserAccountId(Long userId);
}
