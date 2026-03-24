package com.ticketbooking.dto.admin;

import java.math.BigDecimal;

public record AdminSeatInventoryDto(
        Long showtimeId,
        String title,
        String theaterName,
        String screenName,
        long totalSeats,
        long availableSeats,
        long heldSeats,
        long bookedSeats,
        BigDecimal lowestPrice,
        BigDecimal highestPrice
) {
}
