package com.ticketbooking.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminCreateShowtimeRequestDto(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 40) String eventType,
        @NotBlank @Size(max = 4000) String description,
        @NotBlank @Size(max = 80) String genre,
        @NotBlank @Size(max = 80) String language,
        @NotNull Integer durationMinutes,
        @NotNull BigDecimal rating,
        String posterUrl,
        String bannerUrl,
        @Size(max = 1000) String castMembers,
        @Size(max = 120) String organizerName,
        @Size(max = 80) String ageRestriction,
        @NotBlank @Size(max = 120) String venueName,
        @Size(max = 80) String venueType,
        @NotBlank @Size(max = 80) String city,
        @NotBlank @Size(max = 255) String addressLine,
        @NotBlank @Size(max = 40) String screenName,
        @NotBlank @Size(max = 40) String showFormat,
        @NotNull LocalDateTime startTime,
        @NotNull Integer totalRows,
        @NotNull Integer seatsPerRow,
        @NotNull Integer vipRows,
        @NotNull Integer premiumRows,
        @NotNull BigDecimal regularPrice,
        BigDecimal premiumPrice,
        BigDecimal vipPrice
) {
}
