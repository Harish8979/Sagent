package com.ticketbooking.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AdminEventSummaryDto(
        Long eventId,
        String title,
        String eventType,
        String genre,
        String language,
        Integer durationMinutes,
        BigDecimal rating,
        BigDecimal basePrice,
        String organizerName,
        String ageRestriction,
        LocalDate releaseDate,
        boolean upcoming
) {
}
