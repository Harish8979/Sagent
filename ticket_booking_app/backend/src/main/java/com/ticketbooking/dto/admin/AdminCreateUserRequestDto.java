package com.ticketbooking.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequestDto(
        @NotBlank @Size(max = 120) String fullName,
        @Email @Size(max = 160) String email,
        @Size(max = 20) String phoneNumber,
        @NotNull Boolean verified,
        @NotBlank @Size(max = 20) String role,
        @Size(max = 20) String authProvider,
        @Size(max = 20) String preferredChannel
) {
}
