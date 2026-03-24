package com.ticketbooking.service.impl;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketbooking.dto.notification.UserNotificationDto;
import com.ticketbooking.entity.Booking;
import com.ticketbooking.entity.BookingStatus;
import com.ticketbooking.entity.NotificationType;
import com.ticketbooking.entity.UserAccount;
import com.ticketbooking.entity.UserNotification;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.BookingRepository;
import com.ticketbooking.repository.UserAccountRepository;
import com.ticketbooking.repository.UserNotificationRepository;
import com.ticketbooking.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final DateTimeFormatter REMINDER_FORMATTER = DateTimeFormatter.ofPattern("EEE, dd MMM • hh:mm a");

    private final UserNotificationRepository userNotificationRepository;
    private final UserAccountRepository userAccountRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public List<UserNotificationDto> getNotificationsForUser(Long userId) {
        getUser(userId);
        ensureSpecialOfferNotification(userId);
        ensureReminderNotifications(userId);
        return userNotificationRepository.findByUserAccountIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(notification -> new UserNotificationDto(
                        notification.getId(),
                        notification.getType().name(),
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getActionLink(),
                        notification.isRead(),
                        notification.getCreatedAt()
                ))
                .toList();
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        UserNotification notification = userNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!notification.getUserAccount().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setRead(true);
    }

    @Override
    @Transactional
    public void notifyUser(Long userId, NotificationType type, String title, String message, String actionLink) {
        UserAccount userAccount = getUser(userId);
        userNotificationRepository.save(UserNotification.builder()
                .userAccount(userAccount)
                .type(type)
                .title(title)
                .message(message)
                .actionLink(actionLink)
                .read(false)
                .build());
    }

    private void ensureSpecialOfferNotification(Long userId) {
        if (userNotificationRepository.existsByUserAccountIdAndType(userId, NotificationType.SPECIAL_OFFER)) {
            return;
        }
        notifyUser(
                userId,
                NotificationType.SPECIAL_OFFER,
                "Offers unlocked",
                "Use WELCOME10, GROUPSAVE, VIPPASS, or EARLYBIRD on your next checkout for extra savings.",
                "/"
        );
    }

    private void ensureReminderNotifications(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserAccountIdOrderByCreatedAtDesc(userId);
        for (Booking booking : bookings) {
            if (booking.getBookingStatus() != BookingStatus.CONFIRMED) {
                continue;
            }
            if (!booking.getShowtime().getStartTime().isAfter(java.time.LocalDateTime.now())
                    || booking.getShowtime().getStartTime().isAfter(java.time.LocalDateTime.now().plusHours(24))) {
                continue;
            }

            String title = "Reminder: " + booking.getShowtime().getMovie().getTitle();
            String actionLink = "/bookings";
            if (userNotificationRepository.existsByUserAccountIdAndTypeAndTitleAndActionLink(
                    userId,
                    NotificationType.EVENT_REMINDER,
                    title,
                    actionLink
            )) {
                continue;
            }

            notifyUser(
                    userId,
                    NotificationType.EVENT_REMINDER,
                    title,
                    "Your event starts on " + booking.getShowtime().getStartTime().format(REMINDER_FORMATTER) + ".",
                    actionLink
            );
        }
    }

    private UserAccount getUser(Long userId) {
        return userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
