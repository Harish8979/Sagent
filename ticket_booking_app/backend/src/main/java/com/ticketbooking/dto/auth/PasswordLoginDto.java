package com.ticketbooking.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordLoginDto(
        @NotBlank @Size(max = 255) String identifier,
        @NotBlank @Size(min = 6, max = 120) String password
) {
}
