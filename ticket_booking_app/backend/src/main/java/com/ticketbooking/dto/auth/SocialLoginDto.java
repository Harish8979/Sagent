package com.ticketbooking.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SocialLoginDto(
        @NotBlank @Size(max = 40) String provider,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 255) String email
) {
}
