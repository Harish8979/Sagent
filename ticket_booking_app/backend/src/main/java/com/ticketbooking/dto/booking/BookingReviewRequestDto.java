package com.ticketbooking.dto.booking;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record BookingReviewRequestDto(
        @NotNull Long showtimeId,
        @NotEmpty List<Long> seatIds,
        @NotBlank String clientSessionId,
        String promoCode,
        Long existingBookingId
) {
}
