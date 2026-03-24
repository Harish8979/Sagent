package com.ticketbooking.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingReviewDto(
        Long showtimeId,
        String movieTitle,
        String eventType,
        String theaterName,
        String theaterCity,
        String screenName,
        String showFormat,
        LocalDateTime startTime,
        List<String> seats,
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal convenienceFee,
        BigDecimal totalAmount,
        String paymentOrderId,
        String appliedPromoCode,
        String offerSummary,
        boolean modificationFlow
) {
}
