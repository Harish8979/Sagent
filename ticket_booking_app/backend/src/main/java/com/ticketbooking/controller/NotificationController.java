package com.ticketbooking.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketbooking.dto.notification.UserNotificationDto;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.security.AppUserPrincipal;
import com.ticketbooking.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/my")
    public ResponseEntity<List<UserNotificationDto>> getMyNotifications(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(requireUser(principal)));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal AppUserPrincipal principal
    ) {
        notificationService.markAsRead(requireUser(principal), notificationId);
        return ResponseEntity.noContent().build();
    }

    private Long requireUser(AppUserPrincipal principal) {
        if (principal == null) {
            throw new BadRequestException("Authenticated user is required");
        }
        return principal.id();
    }
}
