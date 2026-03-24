package com.ticketbooking.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingSummaryDto(
        Long bookingId,
        String bookingReference,
        Long showtimeId,
        String movieTitle,
        String eventType,
        String theaterName,
        String theaterCity,
        String screenName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        List<String> seats,
        BigDecimal subtotalAmount,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        BigDecimal refundAmount,
        String bookingStatus,
        String paymentStatus,
        String paymentMethod,
        String paymentOrderId,
        String paymentReferenceId,
        String promoCode,
        boolean canCancel,
        boolean canModify,
        String timingCategory,
        LocalDateTime bookedAt
) {
}
