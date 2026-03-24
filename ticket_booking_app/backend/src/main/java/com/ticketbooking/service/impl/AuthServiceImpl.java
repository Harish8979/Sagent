package com.ticketbooking.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ticketbooking.dto.auth.AuthResponseDto;
import com.ticketbooking.dto.auth.OtpRequestDto;
import com.ticketbooking.dto.auth.OtpRequestResponseDto;
import com.ticketbooking.dto.auth.OtpVerifyDto;
import com.ticketbooking.dto.auth.PasswordLoginDto;
import com.ticketbooking.dto.auth.PasswordRegisterDto;
import com.ticketbooking.dto.auth.PasswordResetConfirmDto;
import com.ticketbooking.dto.auth.PasswordResetRequestDto;
import com.ticketbooking.dto.auth.SocialLoginDto;
import com.ticketbooking.dto.auth.UserProfileDto;
import com.ticketbooking.entity.AuthProvider;
import com.ticketbooking.entity.OtpChannel;
import com.ticketbooking.entity.OtpPurpose;
import com.ticketbooking.entity.OtpVerification;
import com.ticketbooking.entity.UserAccount;
import com.ticketbooking.entity.UserRole;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.repository.OtpVerificationRepository;
import com.ticketbooking.repository.UserAccountRepository;
import com.ticketbooking.security.JwtService;
import com.ticketbooking.service.AuthService;
import com.ticketbooking.service.OtpNotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    private final UserAccountRepository userAccountRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final OtpNotificationService otpNotificationService;
    private final JwtService jwtService;

    @Value("${app.auth.expose-debug-otp:false}")
    private boolean exposeDebugOtp;

    @Override
    @Transactional
    public OtpRequestResponseDto requestOtp(OtpRequestDto request) {
        OtpChannel channel = request.channel();
        String target = normalizeTarget(channel, request.email(), request.phoneNumber());

        UserAccount userAccount = findExistingUser(channel, target)
                .orElseGet(() -> UserAccount.builder()
                        .fullName(resolveFullName(request.fullName()))
                        .preferredChannel(channel)
                        .authProvider(AuthProvider.OTP)
                        .role(UserRole.USER)
                        .verified(false)
                        .build());

        if (StringUtils.hasText(request.fullName())) {
            userAccount.setFullName(request.fullName().trim());
        } else if (!StringUtils.hasText(userAccount.getFullName())) {
            userAccount.setFullName(resolveFullName(null));
        }

        userAccount.setPreferredChannel(channel);
        if (userAccount.getAuthProvider() == null) {
            userAccount.setAuthProvider(AuthProvider.OTP);
        }
        if (userAccount.getRole() == null) {
            userAccount.setRole(UserRole.USER);
        }
        if (channel == OtpChannel.EMAIL) {
            userAccount.setEmail(target);
        } else {
            userAccount.setPhoneNumber(target);
        }
        userAccount = userAccountRepository.save(userAccount);

        return issueOtp(userAccount, target, channel, OtpPurpose.LOGIN, "OTP generated successfully");
    }

    @Override
    @Transactional
    public AuthResponseDto verifyOtp(OtpVerifyDto request) {
        String target = normalizeTarget(request.channel(), request.target(), request.target());
        OtpVerification verification = otpVerificationRepository
                .findTopByTargetAndChannelAndPurposeAndUsedFalseOrderByCreatedAtDesc(target, request.channel(), OtpPurpose.LOGIN)
                .orElseThrow(() -> new BadRequestException("No OTP request found for this target"));

        validateOtp(verification, request.otpCode());
        verification.setUsed(true);

        UserAccount userAccount = requireUser(verification);
        userAccount.setVerified(true);
        userAccount.setPreferredChannel(request.channel());
        if (userAccount.getAuthProvider() == null) {
            userAccount.setAuthProvider(AuthProvider.OTP);
        }
        return buildAuthResponse(userAccountRepository.save(userAccount));
    }

    @Override
    @Transactional
    public AuthResponseDto registerWithPassword(PasswordRegisterDto request) {
        String email = normalizeOptionalEmail(request.email());
        String phone = normalizeOptionalPhone(request.phoneNumber());
        if (!StringUtils.hasText(email) && !StringUtils.hasText(phone)) {
            throw new BadRequestException("Either email or phone number is required");
        }

        Optional<UserAccount> emailMatch = StringUtils.hasText(email)
                ? userAccountRepository.findByEmailIgnoreCase(email)
                : Optional.empty();
        Optional<UserAccount> phoneMatch = StringUtils.hasText(phone)
                ? userAccountRepository.findByPhoneNumber(phone)
                : Optional.empty();

        if (emailMatch.isPresent() && phoneMatch.isPresent() && !emailMatch.get().getId().equals(phoneMatch.get().getId())) {
            throw new BadRequestException("Email and phone number belong to different accounts");
        }

        UserAccount userAccount = emailMatch.or(() -> phoneMatch)
                .orElseGet(() -> UserAccount.builder()
                        .role(UserRole.USER)
                        .verified(true)
                        .build());

        userAccount.setFullName(resolveFullName(request.fullName()));
        userAccount.setEmail(email);
        userAccount.setPhoneNumber(phone);
        userAccount.setPreferredChannel(StringUtils.hasText(email) ? OtpChannel.EMAIL : OtpChannel.MOBILE);
        userAccount.setPasswordHash(PASSWORD_ENCODER.encode(request.password()));
        userAccount.setAuthProvider(AuthProvider.PASSWORD);
        userAccount.setRole(userAccount.getRole() != null ? userAccount.getRole() : UserRole.USER);
        userAccount.setVerified(true);

        return buildAuthResponse(userAccountRepository.save(userAccount));
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto loginWithPassword(PasswordLoginDto request) {
        String identifier = request.identifier().trim();
        UserAccount userAccount = findByIdentifier(identifier)
                .orElseThrow(() -> new BadRequestException("Account not found"));

        if (!StringUtils.hasText(userAccount.getPasswordHash())) {
            throw new BadRequestException("This account does not have password login enabled");
        }
        if (!PASSWORD_ENCODER.matches(request.password(), userAccount.getPasswordHash())) {
            throw new BadRequestException("Incorrect password");
        }

        return buildAuthResponse(userAccount);
    }

    @Override
    @Transactional
    public AuthResponseDto socialLogin(SocialLoginDto request) {
        AuthProvider provider = resolveProvider(request.provider());
        String email = normalizeTarget(OtpChannel.EMAIL, request.email(), request.email());

        UserAccount userAccount = userAccountRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> UserAccount.builder()
                        .fullName(resolveFullName(request.fullName()))
                        .email(email)
                        .preferredChannel(OtpChannel.EMAIL)
                        .role(UserRole.USER)
                        .verified(true)
                        .build());

        userAccount.setFullName(resolveFullName(request.fullName()));
        userAccount.setEmail(email);
        userAccount.setPreferredChannel(OtpChannel.EMAIL);
        userAccount.setVerified(true);
        userAccount.setAuthProvider(provider);
        userAccount.setRole(userAccount.getRole() != null ? userAccount.getRole() : UserRole.USER);

        return buildAuthResponse(userAccountRepository.save(userAccount));
    }

    @Override
    @Transactional
    public OtpRequestResponseDto requestPasswordReset(PasswordResetRequestDto request) {
        OtpChannel channel = request.channel();
        String target = normalizeTarget(channel, request.email(), request.phoneNumber());
        UserAccount userAccount = findExistingUser(channel, target)
                .orElseThrow(() -> new BadRequestException("No account found for this target"));

        return issueOtp(userAccount, target, channel, OtpPurpose.PASSWORD_RESET, "Password reset OTP generated successfully");
    }

    @Override
    @Transactional
    public AuthResponseDto confirmPasswordReset(PasswordResetConfirmDto request) {
        String target = normalizeTarget(request.channel(), request.target(), request.target());
        OtpVerification verification = otpVerificationRepository
                .findTopByTargetAndChannelAndPurposeAndUsedFalseOrderByCreatedAtDesc(target, request.channel(), OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new BadRequestException("No password reset request found for this target"));

        validateOtp(verification, request.otpCode());
        verification.setUsed(true);

        UserAccount userAccount = requireUser(verification);
        userAccount.setPasswordHash(PASSWORD_ENCODER.encode(request.newPassword()));
        userAccount.setPreferredChannel(request.channel());
        userAccount.setVerified(true);
        userAccount.setAuthProvider(AuthProvider.PASSWORD);
        userAccount.setRole(userAccount.getRole() != null ? userAccount.getRole() : UserRole.USER);

        return buildAuthResponse(userAccountRepository.save(userAccount));
    }

    private OtpRequestResponseDto issueOtp(
            UserAccount userAccount,
            String target,
            OtpChannel channel,
            OtpPurpose purpose,
            String message
    ) {
        String otpCode = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        otpVerificationRepository.save(OtpVerification.builder()
                .userAccount(userAccount)
                .target(target)
                .channel(channel)
                .purpose(purpose)
                .otpCode(otpCode)
                .used(false)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build());

        otpNotificationService.sendOtp(userAccount, target, channel, otpCode);
        return new OtpRequestResponseDto(
                message,
                target,
                channel,
                exposeDebugOtp ? otpCode : null
        );
    }

    private void validateOtp(OtpVerification verification, String submittedOtp) {
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }
        if (!verification.getOtpCode().equals(submittedOtp)) {
            throw new BadRequestException("Invalid OTP");
        }
    }

    private UserAccount requireUser(OtpVerification verification) {
        UserAccount userAccount = verification.getUserAccount();
        if (userAccount == null) {
            throw new BadRequestException("No user associated with this OTP");
        }
        return userAccount;
    }

    private Optional<UserAccount> findExistingUser(OtpChannel channel, String target) {
        return channel == OtpChannel.EMAIL
                ? userAccountRepository.findByEmailIgnoreCase(target)
                : userAccountRepository.findByPhoneNumber(target);
    }

    private Optional<UserAccount> findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userAccountRepository.findByEmailIgnoreCase(identifier.trim().toLowerCase(Locale.ROOT));
        }
        return userAccountRepository.findByPhoneNumber(normalizeOptionalPhone(identifier));
    }

    private String normalizeTarget(OtpChannel channel, String email, String phoneNumber) {
        if (channel == OtpChannel.EMAIL) {
            String normalizedEmail = normalizeOptionalEmail(email);
            if (!StringUtils.hasText(normalizedEmail)) {
                throw new BadRequestException("Email is required for EMAIL OTP");
            }
            return normalizedEmail;
        }

        String normalizedPhone = normalizeOptionalPhone(phoneNumber);
        if (!StringUtils.hasText(normalizedPhone)) {
            throw new BadRequestException("Phone number is required for MOBILE OTP");
        }
        return normalizedPhone;
    }

    private String normalizeOptionalEmail(String email) {
        return StringUtils.hasText(email) ? email.trim().toLowerCase(Locale.ROOT) : null;
    }

    private String normalizeOptionalPhone(String phoneNumber) {
        if (!StringUtils.hasText(phoneNumber)) {
            return null;
        }
        String normalized = phoneNumber.replaceAll("[^\\d+]", "");
        if (!StringUtils.hasText(normalized)) {
            throw new BadRequestException("Phone number is invalid");
        }
        return normalized;
    }

    private String resolveFullName(String fullName) {
        return StringUtils.hasText(fullName) ? fullName.trim() : "Guest User";
    }

    private AuthProvider resolveProvider(String provider) {
        try {
            return AuthProvider.valueOf(provider.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Unsupported social login provider");
        }
    }

    private AuthResponseDto buildAuthResponse(UserAccount userAccount) {
        String token = jwtService.generateToken(userAccount);
        return new AuthResponseDto(
                token,
                Instant.now().plusMillis(jwtService.getExpirationMs()),
                toUserProfile(userAccount)
        );
    }

    private UserProfileDto toUserProfile(UserAccount userAccount) {
        return new UserProfileDto(
                userAccount.getId(),
                userAccount.getFullName(),
                userAccount.getEmail(),
                userAccount.getPhoneNumber(),
                userAccount.isVerified(),
                userAccount.getAuthProvider() != null ? userAccount.getAuthProvider().name() : AuthProvider.OTP.name(),
                StringUtils.hasText(userAccount.getPasswordHash()),
                userAccount.getRole() != null ? userAccount.getRole().name() : UserRole.USER.name()
        );
    }
}
