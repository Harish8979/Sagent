package com.ticketbooking.service;

import java.util.List;

import com.ticketbooking.dto.notification.UserNotificationDto;
import com.ticketbooking.entity.NotificationType;

public interface NotificationService {

    List<UserNotificationDto> getNotificationsForUser(Long userId);

    void markAsRead(Long userId, Long notificationId);

    void notifyUser(Long userId, NotificationType type, String title, String message, String actionLink);
}
