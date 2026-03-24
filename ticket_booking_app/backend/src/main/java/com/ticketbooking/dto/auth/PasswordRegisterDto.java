package com.ticketbooking.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordRegisterDto(
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 255) String email,
        @Size(max = 30) String phoneNumber,
        @NotBlank @Size(min = 6, max = 120) String password
) {
}
