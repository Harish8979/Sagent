package com.ticketbooking.dto.admin;

import java.math.BigDecimal;

public record AdminEventSeatSummaryDto(
        Long showtimeId,
        String title,
        String eventType,
        String theaterName,
        String screenName,
        long vipSeats,
        long premiumSeats,
        long regularSeats,
        long bookedSeats,
        long totalSeats,
        BigDecimal occupancyRate
) {
}
