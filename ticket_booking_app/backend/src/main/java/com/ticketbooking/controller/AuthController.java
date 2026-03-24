package com.ticketbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketbooking.dto.auth.AuthResponseDto;
import com.ticketbooking.dto.auth.OtpRequestDto;
import com.ticketbooking.dto.auth.OtpRequestResponseDto;
import com.ticketbooking.dto.auth.OtpVerifyDto;
import com.ticketbooking.dto.auth.PasswordLoginDto;
import com.ticketbooking.dto.auth.PasswordRegisterDto;
import com.ticketbooking.dto.auth.PasswordResetConfirmDto;
import com.ticketbooking.dto.auth.PasswordResetRequestDto;
import com.ticketbooking.dto.auth.SocialLoginDto;
import com.ticketbooking.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/request-otp")
    public ResponseEntity<OtpRequestResponseDto> requestOtp(@Valid @RequestBody OtpRequestDto request) {
        return ResponseEntity.ok(authService.requestOtp(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponseDto> verifyOtp(@Valid @RequestBody OtpVerifyDto request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> registerWithPassword(@Valid @RequestBody PasswordRegisterDto request) {
        return ResponseEntity.ok(authService.registerWithPassword(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> loginWithPassword(@Valid @RequestBody PasswordLoginDto request) {
        return ResponseEntity.ok(authService.loginWithPassword(request));
    }

    @PostMapping("/social-login")
    public ResponseEntity<AuthResponseDto> socialLogin(@Valid @RequestBody SocialLoginDto request) {
        return ResponseEntity.ok(authService.socialLogin(request));
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<OtpRequestResponseDto> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDto request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<AuthResponseDto> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmDto request) {
        return ResponseEntity.ok(authService.confirmPasswordReset(request));
    }
}
