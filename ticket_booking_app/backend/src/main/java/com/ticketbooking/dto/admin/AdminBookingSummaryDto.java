package com.ticketbooking.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminBookingSummaryDto(
        Long bookingId,
        String bookingReference,
        String customerName,
        String customerContact,
        String title,
        String seats,
        String bookingStatus,
        String paymentStatus,
        BigDecimal totalAmount,
        BigDecimal refundAmount,
        LocalDateTime createdAt
) {
}
