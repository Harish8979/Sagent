package com.ticketbooking.dto.admin;

import java.util.List;

public record AdminDashboardDto(
        AdminAnalyticsDto analytics,
        List<AdminEventSummaryDto> events,
        List<AdminVenueSummaryDto> venues,
        List<AdminSeatInventoryDto> seatInventory,
        List<AdminShowtimeSummaryDto> schedules,
        List<AdminEventSeatSummaryDto> eventSeats,
        List<AdminBookingSummaryDto> bookings,
        List<AdminUserSummaryDto> users,
        List<AdminPaymentSummaryDto> payments,
        List<AdminCancellationSummaryDto> cancellations
) {
}
