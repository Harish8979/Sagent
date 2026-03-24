package com.ticketbooking.dto.booking;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ConfirmBookingRequestDto(
        @NotNull Long showtimeId,
        @NotEmpty List<Long> seatIds,
        @NotBlank String clientSessionId,
        @NotBlank String paymentOrderId,
        String paymentReferenceId,
        @NotBlank String paymentMethod,
        String promoCode,
        Long existingBookingId
) {
}
