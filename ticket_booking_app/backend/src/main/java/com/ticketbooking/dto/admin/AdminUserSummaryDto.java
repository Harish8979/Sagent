package com.ticketbooking.dto.admin;

import java.time.LocalDateTime;

public record AdminUserSummaryDto(
        Long userId,
        String fullName,
        String email,
        String phoneNumber,
        boolean verified,
        String authProvider,
        String role,
        LocalDateTime createdAt
) {
}
