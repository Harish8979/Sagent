package com.ticketbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketbooking.dto.admin.AdminCancelShowtimeRequestDto;
import com.ticketbooking.dto.admin.AdminCreateUserRequestDto;
import com.ticketbooking.dto.admin.AdminCreateShowtimeRequestDto;
import com.ticketbooking.dto.admin.AdminDashboardDto;
import com.ticketbooking.dto.admin.AdminRemoveEventRequestDto;
import com.ticketbooking.dto.admin.AdminSendTestEmailRequestDto;
import com.ticketbooking.dto.admin.AdminShowtimeSummaryDto;
import com.ticketbooking.dto.admin.AdminUpdateUserRequestDto;
import com.ticketbooking.dto.admin.AdminUserSummaryDto;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.security.AppUserPrincipal;
import com.ticketbooking.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @PostMapping("/showtimes")
    public ResponseEntity<AdminShowtimeSummaryDto> createShowtime(@Valid @RequestBody AdminCreateShowtimeRequestDto request) {
        return ResponseEntity.ok(adminService.createShowtime(request));
    }

    @PostMapping("/showtimes/{showtimeId}/cancel")
    public ResponseEntity<Void> cancelShowtime(
            @PathVariable Long showtimeId,
            @Valid @RequestBody AdminCancelShowtimeRequestDto request
    ) {
        adminService.cancelShowtime(showtimeId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events/{eventId}/remove")
    public ResponseEntity<Void> removeEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody AdminRemoveEventRequestDto request
    ) {
        adminService.removeEvent(eventId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/notifications/email/test")
    public ResponseEntity<Void> sendTestEmail(@Valid @RequestBody AdminSendTestEmailRequestDto request) {
        adminService.sendTestEmail(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserSummaryDto> createUser(
            @Valid @RequestBody AdminCreateUserRequestDto request,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(adminService.createUser(request, requireUser(principal)));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<AdminUserSummaryDto> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRequestDto request,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        return ResponseEntity.ok(adminService.updateUser(userId, request, requireUser(principal)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        adminService.deleteUser(userId, requireUser(principal));
        return ResponseEntity.noContent().build();
    }

    private Long requireUser(AppUserPrincipal principal) {
        if (principal == null) {
            throw new BadRequestException("Authenticated user is required");
        }
        return principal.id();
    }
}
