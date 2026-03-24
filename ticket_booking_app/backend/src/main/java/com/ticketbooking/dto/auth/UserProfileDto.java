package com.ticketbooking.dto.auth;

public record UserProfileDto(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        boolean verified,
        String authProvider,
        boolean hasPassword,
        String role
) {
}
