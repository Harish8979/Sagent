package com.ticketbooking.dto.admin;

public record AdminVenueSummaryDto(
        Long venueId,
        String venueName,
        String city,
        String venueType,
        String addressLine,
        Integer totalRows,
        Integer seatsPerRow,
        long totalConfiguredSeats
) {
}
