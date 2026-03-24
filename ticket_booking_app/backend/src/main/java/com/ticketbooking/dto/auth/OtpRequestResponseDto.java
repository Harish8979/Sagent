package com.ticketbooking.dto.auth;

import com.ticketbooking.entity.OtpChannel;

public record OtpRequestResponseDto(
        String message,
        String target,
        OtpChannel channel,
        String debugOtp
) {
}
