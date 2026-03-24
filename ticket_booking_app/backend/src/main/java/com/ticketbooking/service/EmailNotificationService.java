package com.ticketbooking.service;

import com.ticketbooking.entity.Booking;
import com.ticketbooking.entity.UserAccount;

public interface EmailNotificationService {

    void sendBookingConfirmation(UserAccount userAccount, Booking booking);

    void sendTestEmail(String recipientEmail, String requestedByLabel);
}
