package com.ticketbooking.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticketbooking.entity.Showtime;
import com.ticketbooking.entity.ShowtimeStatus;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    Optional<Showtime> findByMovieIdAndTheaterIdAndStartTime(Long movieId, Long theaterId, LocalDateTime startTime);

    @EntityGraph(attributePaths = {"movie", "theater"})
    List<Showtime> findByStartTimeAfterAndStatusOrderByStartTimeAsc(LocalDateTime cutoff, ShowtimeStatus status);

    @EntityGraph(attributePaths = {"movie", "theater"})
    List<Showtime> findAllByOrderByStartTimeDesc();

    @EntityGraph(attributePaths = {"movie", "theater"})
    List<Showtime> findByMovieIdOrderByStartTimeDesc(Long movieId);

    @Query("select s from Showtime s join fetch s.movie join fetch s.theater where s.id = :showtimeId")
    Optional<Showtime> findDetailedShowtimeById(@Param("showtimeId") Long showtimeId);
}
