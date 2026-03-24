package com.ticketbooking.service;

import com.ticketbooking.entity.OtpChannel;
import com.ticketbooking.entity.UserAccount;

public interface OtpNotificationService {

    void sendOtp(UserAccount userAccount, String target, OtpChannel channel, String otpCode);
}
