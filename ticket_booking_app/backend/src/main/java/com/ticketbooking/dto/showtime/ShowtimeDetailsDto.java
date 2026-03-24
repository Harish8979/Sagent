package com.ticketbooking.dto.showtime;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ShowtimeDetailsDto(
        Long showtimeId,
        Long movieId,
        String movieTitle,
        String movieDescription,
        String eventType,
        String movieGenre,
        String movieLanguage,
        Integer durationMinutes,
        BigDecimal rating,
        String castMembers,
        String organizerName,
        String ageRestriction,
        String movieBannerUrl,
        String moviePosterUrl,
        String theaterName,
        String theaterCity,
        String theaterAddress,
        String theaterVenueType,
        String screenName,
        String showFormat,
        String showtimeStatus,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BigDecimal basePrice,
        List<SeatDto> seats
) {
}
