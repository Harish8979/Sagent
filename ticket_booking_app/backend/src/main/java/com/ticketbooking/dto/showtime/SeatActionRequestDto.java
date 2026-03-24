package com.ticketbooking.dto.showtime;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record SeatActionRequestDto(
        @NotEmpty List<Long> seatIds,
        @NotBlank String clientSessionId
) {
}
