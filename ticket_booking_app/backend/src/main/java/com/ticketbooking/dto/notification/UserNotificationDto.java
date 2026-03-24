package com.ticketbooking.dto.notification;

import java.time.LocalDateTime;

public record UserNotificationDto(
        Long id,
        String type,
        String title,
        String message,
        String actionLink,
        boolean read,
        LocalDateTime createdAt
) {
}
