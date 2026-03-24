package com.ticketbooking.service;

import com.ticketbooking.dto.auth.AuthResponseDto;
import com.ticketbooking.dto.auth.OtpRequestDto;
import com.ticketbooking.dto.auth.OtpRequestResponseDto;
import com.ticketbooking.dto.auth.OtpVerifyDto;
import com.ticketbooking.dto.auth.PasswordLoginDto;
import com.ticketbooking.dto.auth.PasswordRegisterDto;
import com.ticketbooking.dto.auth.PasswordResetConfirmDto;
import com.ticketbooking.dto.auth.PasswordResetRequestDto;
import com.ticketbooking.dto.auth.SocialLoginDto;

public interface AuthService {

    OtpRequestResponseDto requestOtp(OtpRequestDto request);

    AuthResponseDto verifyOtp(OtpVerifyDto request);

    AuthResponseDto registerWithPassword(PasswordRegisterDto request);

    AuthResponseDto loginWithPassword(PasswordLoginDto request);

    AuthResponseDto socialLogin(SocialLoginDto request);

    OtpRequestResponseDto requestPasswordReset(PasswordResetRequestDto request);

    AuthResponseDto confirmPasswordReset(PasswordResetConfirmDto request);
}
