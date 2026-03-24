package com.ticketbooking.dto.discovery;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FeaturedMovieDto(
        Long id,
        String title,
        String description,
        String eventType,
        String genre,
        String language,
        Integer durationMinutes,
        BigDecimal rating,
        String posterUrl,
        String bannerUrl,
        LocalDate releaseDate,
        BigDecimal basePrice,
        String castMembers,
        String organizerName,
        String ageRestriction
) {
}
