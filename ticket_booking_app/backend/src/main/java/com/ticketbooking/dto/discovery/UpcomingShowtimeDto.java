package com.ticketbooking.dto.discovery;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpcomingShowtimeDto(
        Long showtimeId,
        Long movieId,
        String movieTitle,
        String eventType,
        String genre,
        String posterUrl,
        String theaterName,
        String city,
        String venueType,
        String screenName,
        String showFormat,
        LocalDateTime startTime,
        BigDecimal price,
        BigDecimal rating,
        Integer durationMinutes,
        String organizerName,
        String castMembers,
        String ageRestriction
) {
}
