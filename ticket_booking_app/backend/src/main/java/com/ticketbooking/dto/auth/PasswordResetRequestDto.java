package com.ticketbooking.dto.auth;

import com.ticketbooking.entity.OtpChannel;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PasswordResetRequestDto(
        @Size(max = 255) String email,
        @Size(max = 30) String phoneNumber,
        @NotNull OtpChannel channel
) {
}
