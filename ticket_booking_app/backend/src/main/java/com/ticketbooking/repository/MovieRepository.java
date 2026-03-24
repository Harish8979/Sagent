package com.ticketbooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.entity.Movie;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    Optional<Movie> findByTitleIgnoreCase(String title);

    List<Movie> findTop12ByUpcomingTrueOrderByReleaseDateAsc();
}
