package com.ticketbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketbooking.dto.showtime.SeatActionRequestDto;
import com.ticketbooking.dto.showtime.SeatMapUpdateDto;
import com.ticketbooking.dto.showtime.ShowtimeDetailsDto;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.security.AppUserPrincipal;
import com.ticketbooking.service.ShowtimeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping("/{showtimeId}")
    public ResponseEntity<ShowtimeDetailsDto> getShowtimeDetails(@PathVariable Long showtimeId) {
        return ResponseEntity.ok(showtimeService.getShowtimeDetails(showtimeId));
    }

    @PostMapping("/{showtimeId}/seats/select")
    public ResponseEntity<SeatMapUpdateDto> selectSeats(
            @PathVariable Long showtimeId,
            @Valid @RequestBody SeatActionRequestDto request,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(showtimeService.selectSeats(showtimeId, request.seatIds(), requireUser(principal), request.clientSessionId()));
    }

    @PostMapping("/{showtimeId}/seats/release")
    public ResponseEntity<SeatMapUpdateDto> releaseSeats(
            @PathVariable Long showtimeId,
            @Valid @RequestBody SeatActionRequestDto request,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(showtimeService.releaseSeats(showtimeId, request.seatIds(), requireUser(principal), request.clientSessionId()));
    }

    private Long requireUser(AppUserPrincipal principal) {
        if (principal == null) {
            throw new BadRequestException("Authenticated user is required");
        }
        return principal.id();
    }
}
