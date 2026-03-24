package com.ticketbooking.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminShowtimeSummaryDto(
        Long showtimeId,
        String title,
        String eventType,
        String theaterName,
        String city,
        String screenName,
        String showFormat,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String status,
        BigDecimal price,
        long totalSeats,
        long bookedSeats,
        BigDecimal occupancyRate
) {
}
