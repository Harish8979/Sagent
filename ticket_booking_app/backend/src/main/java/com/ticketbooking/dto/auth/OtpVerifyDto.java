package com.ticketbooking.dto.auth;

import com.ticketbooking.entity.OtpChannel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OtpVerifyDto(
        @NotBlank @Size(max = 255) String target,
        @NotNull OtpChannel channel,
        @NotBlank @Size(min = 4, max = 8) String otpCode
) {
}
