package com.ticketbooking.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminPaymentSummaryDto(
        Long bookingId,
        String bookingReference,
        String customerName,
        String title,
        String paymentMethod,
        String paymentStatus,
        BigDecimal totalAmount,
        BigDecimal refundAmount,
        String paymentReference,
        LocalDateTime updatedAt
) {
}
