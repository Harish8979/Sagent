package com.ticketbooking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.entity.Theater;

public interface TheaterRepository extends JpaRepository<Theater, Long> {

    Optional<Theater> findByNameIgnoreCaseAndCityIgnoreCase(String name, String city);
}
