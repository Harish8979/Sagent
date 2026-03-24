package com.ticketbooking.dto.auth;

import java.time.Instant;

public record AuthResponseDto(
        String token,
        Instant expiresAt,
        UserProfileDto user
) {
}
