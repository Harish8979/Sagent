package com.ticketbooking.dto.showtime;

import java.time.Instant;
import java.util.List;

public record SeatMapUpdateDto(
        Long showtimeId,
        Instant updatedAt,
        List<SeatDto> seats
) {
}
