package com.ticketbooking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketbooking.dto.booking.BookingReviewDto;
import com.ticketbooking.dto.booking.BookingReviewRequestDto;
import com.ticketbooking.dto.booking.BookingSummaryDto;
import com.ticketbooking.dto.booking.ConfirmBookingRequestDto;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.security.AppUserPrincipal;
import com.ticketbooking.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/review")
    public ResponseEntity<BookingReviewDto> createReview(
            @Valid @RequestBody BookingReviewRequestDto request,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(bookingService.createBookingReview(requireUser(principal), request));
    }

    @PostMapping("/confirm")
    public ResponseEntity<BookingSummaryDto> confirmBooking(
            @Valid @RequestBody ConfirmBookingRequestDto request,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(bookingService.confirmBooking(requireUser(principal), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingSummaryDto>> getMyBookings(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(bookingService.getBookingsForUser(requireUser(principal)));
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<BookingSummaryDto> cancelBookingAction(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(requireUser(principal), bookingId));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<BookingSummaryDto> cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(bookingService.cancelBooking(requireUser(principal), bookingId));
    }

    private Long requireUser(AppUserPrincipal principal) {
        if (principal == null) {
            throw new BadRequestException("Authenticated user is required");
        }
        return principal.id();
    }
}
