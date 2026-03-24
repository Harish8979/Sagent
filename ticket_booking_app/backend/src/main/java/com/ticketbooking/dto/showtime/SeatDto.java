package com.ticketbooking.dto.showtime;

import java.math.BigDecimal;

import com.ticketbooking.entity.SeatStatus;

public record SeatDto(
        Long id,
        String label,
        String seatRow,
        Integer seatNumber,
        BigDecimal price,
        String seatCategory,
        SeatStatus status,
        String selectedBySessionId
) {
}
