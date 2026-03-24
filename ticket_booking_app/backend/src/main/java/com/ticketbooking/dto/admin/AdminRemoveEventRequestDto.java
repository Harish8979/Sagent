package com.ticketbooking.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminRemoveEventRequestDto(
        @NotBlank @Size(max = 500) String reason
) {
}
