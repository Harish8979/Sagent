package com.ticketbooking.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminCancellationSummaryDto(
        String cancellationType,
        Long referenceId,
        String referenceLabel,
        String title,
        String customerName,
        String status,
        BigDecimal refundAmount,
        String note,
        LocalDateTime updatedAt
) {
}
