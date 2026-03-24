package com.ticketbooking.dto.admin;

import java.math.BigDecimal;

public record AdminAnalyticsDto(
        long totalBookings,
        long confirmedBookings,
        long cancelledBookings,
        BigDecimal grossRevenue,
        BigDecimal refundAmount,
        BigDecimal occupancyRate
) {
}
