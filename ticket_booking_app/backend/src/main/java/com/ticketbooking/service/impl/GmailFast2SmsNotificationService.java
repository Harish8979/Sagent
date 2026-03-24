package com.ticketbooking.service.impl;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.ticketbooking.entity.Booking;
import com.ticketbooking.entity.OtpChannel;
import com.ticketbooking.entity.UserAccount;
import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.service.EmailNotificationService;
import com.ticketbooking.service.OtpNotificationService;

import jakarta.mail.internet.MimeMessage;

@Service
public class GmailFast2SmsNotificationService implements EmailNotificationService, OtpNotificationService {

    private static final Logger log = LoggerFactory.getLogger(GmailFast2SmsNotificationService.class);
    private static final DateTimeFormatter SHOWTIME_FORMATTER = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy hh:mm a");

    private final JavaMailSender mailSender;
    private final RestClient restClient;
    private final String fromEmail;
    private final boolean smsEnabled;
    private final String fast2SmsApiKey;
    private final String fast2SmsUrl;
    private final boolean preferResendEmail;
    private final String resendApiKey;
    private final String resendUrl;
    private final String resendFromEmail;

    public GmailFast2SmsNotificationService(
            JavaMailSender mailSender,
            RestClient.Builder restClientBuilder,
            @Value("${spring.mail.username:}") String fromEmail,
            @Value("${app.notifications.sms.enabled:true}") boolean smsEnabled,
            @Value("${fast2sms.api.key:}") String fast2SmsApiKey,
            @Value("${fast2sms.url:https://www.fast2sms.com/dev/bulkV2}") String fast2SmsUrl,
            @Value("${app.notifications.email.prefer-resend:true}") boolean preferResendEmail,
            @Value("${resend.api.key:}") String resendApiKey,
            @Value("${resend.url:https://api.resend.com/emails}") String resendUrl,
            @Value("${resend.from-email:PulseSeats <onboarding@resend.dev>}") String resendFromEmail
    ) {
        this.mailSender = mailSender;
        this.restClient = restClientBuilder.build();
        this.fromEmail = fromEmail;
        this.smsEnabled = smsEnabled;
        this.fast2SmsApiKey = fast2SmsApiKey;
        this.fast2SmsUrl = fast2SmsUrl;
        this.preferResendEmail = preferResendEmail;
        this.resendApiKey = resendApiKey;
        this.resendUrl = resendUrl;
        this.resendFromEmail = resendFromEmail;
    }

    @Override
    public void sendBookingConfirmation(UserAccount userAccount, Booking booking) {
        sendConfirmationEmail(userAccount, booking);
        sendConfirmationSms(userAccount, booking);
    }

    @Override
    public void sendTestEmail(String recipientEmail, String requestedByLabel) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Skipping test email because recipient is empty.");
            return;
        }

        String subject = "PulseSeats email test";
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
                  <h2 style="margin:0 0 10px">PulseSeats email setup is working</h2>
                  <p>This is a test email triggered from the admin panel.</p>
                  <p>
                    <strong>Triggered by:</strong> %s<br/>
                    <strong>Generated at:</strong> %s
                  </p>
                </div>
                """.formatted(
                safe(requestedByLabel),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );

        sendEmail(
                recipientEmail.trim(),
                subject,
                html,
                "admin test",
                "Unable to send test email. Check SMTP configuration and try again."
        );
    }

    @Override
    public void sendOtp(UserAccount userAccount, String target, OtpChannel channel, String otpCode) {
        if (channel == OtpChannel.EMAIL) {
            sendOtpEmail(userAccount, target, otpCode);
            return;
        }
        sendOtpSms(
                target,
                otpCode,
                userAccount != null ? userAccount.getId() : null,
                "Unable to send OTP to mobile number right now. Please try again."
        );
    }

    private void sendConfirmationEmail(UserAccount userAccount, Booking booking) {
        String recipient = userAccount.getEmail();
        if (recipient == null || recipient.isBlank()) {
            log.info("Skipping booking email for user {} because no email is configured.", userAccount.getId());
            return;
        }

        List<String> seatLabels = booking.getSeats().stream()
                .map(seat -> seat.getLabel())
                .sorted()
                .collect(Collectors.toList());
        String showtime = booking.getShowtime().getStartTime().format(SHOWTIME_FORMATTER);

        String subject = "Booking Confirmed - " + booking.getShowtime().getMovie().getTitle();
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
                  <h2 style="margin:0 0 10px">Your booking is confirmed</h2>
                  <p>Hi %s,</p>
                  <p>Your ticket for <strong>%s</strong> has been confirmed.</p>
                  <p>
                    <strong>Booking ID:</strong> %s<br/>
                    <strong>Venue:</strong> %s, %s<br/>
                    <strong>Screen:</strong> %s<br/>
                    <strong>Showtime:</strong> %s<br/>
                    <strong>Seats:</strong> %s<br/>
                    <strong>Total Paid:</strong> Rs.%s
                  </p>
                  <p>Thank you for booking with PulseSeats.</p>
                </div>
                """.formatted(
                safe(userAccount.getFullName()),
                safe(booking.getShowtime().getMovie().getTitle()),
                safe(booking.getBookingReference()),
                safe(booking.getShowtime().getTheater().getName()),
                safe(booking.getShowtime().getTheater().getCity()),
                safe(booking.getShowtime().getScreenName()),
                safe(showtime),
                String.join(", ", seatLabels),
                booking.getTotalAmount() != null ? booking.getTotalAmount().toPlainString() : "0.00"
        );

        sendEmail(recipient.trim(), subject, html, "booking " + booking.getId(), null);
    }

    private void sendOtpEmail(UserAccount userAccount, String recipient, String otpCode) {
        if (recipient == null || recipient.isBlank()) {
            log.info("Skipping OTP email because recipient is empty for user {}", userAccount != null ? userAccount.getId() : null);
            return;
        }

        String subject = "PulseSeats OTP Verification";
        String html = """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
                  <h2 style="margin:0 0 10px">Your PulseSeats OTP</h2>
                  <p>Hi %s,</p>
                  <p>Use the OTP below to continue your verification.</p>
                  <p style="font-size:24px;font-weight:700;letter-spacing:4px;margin:14px 0;">%s</p>
                  <p>This OTP is valid for 10 minutes.</p>
                  <p>If you did not request this OTP, please ignore this email.</p>
                </div>
                """.formatted(
                safe(userAccount != null ? userAccount.getFullName() : "User"),
                safe(otpCode)
        );

        sendEmail(
                recipient.trim(),
                subject,
                html,
                "otp email",
                "Unable to send OTP email right now. Please try again in a few minutes."
        );
    }

    private void sendEmail(String recipient, String subject, String html, String context, String failureMessage) {
        boolean sent;
        if (preferResendEmail) {
            sent = sendEmailViaResend(recipient, subject, html, context, failureMessage)
                    || sendEmailViaSmtp(recipient, subject, html, context);
        } else {
            sent = sendEmailViaSmtp(recipient, subject, html, context)
                    || sendEmailViaResend(recipient, subject, html, context, failureMessage);
        }

        if (!sent) {
            throwIfCritical(failureMessage);
        }
    }

    private boolean sendEmailViaSmtp(String recipient, String subject, String html, String context) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Mail sender is not configured. Unable to send {} email to {}", context, recipient);
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromEmail);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent via SMTP. context={} recipient={}", context, recipient);
            return true;
        } catch (Exception exception) {
            log.warn("Failed to send email via SMTP. context={} recipient={} error={}", context, recipient, exception.getMessage());
            return false;
        }
    }

    private boolean sendEmailViaResend(String recipient, String subject, String html, String context, String failureMessage) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            return false;
        }

        String fromAddress = resolveResendFromAddress();
        try {
            restClient.post()
                    .uri(resendUrl)
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(Map.of(
                            "from", fromAddress,
                            "to", List.of(recipient),
                            "subject", subject,
                            "html", html
                    ))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Email sent via Resend. context={} recipient={}", context, recipient);
            return true;
        } catch (RestClientResponseException exception) {
            String responseBody = exception.getResponseBodyAsString();
            if (failureMessage != null && !failureMessage.isBlank()) {
                if (exception.getRawStatusCode() == 401) {
                    throw new BadRequestException("Resend API key is invalid. Update RESEND_API_KEY and try again.");
                }
                if (exception.getRawStatusCode() == 403
                        && responseBody != null
                        && responseBody.contains("You can only send testing emails to your own email address")) {
                    throw new BadRequestException(
                            "Email provider is in test mode. Send OTP to your own verified address or verify a domain in Resend."
                    );
                }
            }
            log.warn(
                    "Failed to send email via Resend. context={} recipient={} status={} body={}",
                    context,
                    recipient,
                    exception.getRawStatusCode(),
                    responseBody
            );
            return false;
        } catch (Exception exception) {
            log.warn("Failed to send email via Resend. context={} recipient={} error={}", context, recipient, exception.getMessage());
            return false;
        }
    }

    private String resolveResendFromAddress() {
        if (resendFromEmail != null && !resendFromEmail.isBlank()) {
            return resendFromEmail.trim();
        }
        if (fromEmail != null && !fromEmail.isBlank()) {
            return fromEmail.trim();
        }
        return "PulseSeats <onboarding@resend.dev>";
    }

    private void sendConfirmationSms(UserAccount userAccount, Booking booking) {
        if (!smsEnabled) {
            return;
        }
        if (fast2SmsApiKey == null || fast2SmsApiKey.isBlank()) {
            return;
        }

        String number = normalizeIndianNumber(userAccount.getPhoneNumber());
        if (number == null) {
            return;
        }

        String showtime = booking.getShowtime().getStartTime().format(SHOWTIME_FORMATTER);
        String message = "Booking confirmed for " + safe(booking.getShowtime().getMovie().getTitle())
                + ". Ref: " + safe(booking.getBookingReference())
                + ", Seats: " + compactSeatLabels(booking)
                + ", Time: " + showtime;

        String formBody = "route=q"
                + "&language=english"
                + "&flash=0"
                + "&numbers=" + urlEncode(number)
                + "&message=" + urlEncode(message);

        try {
            restClient.post()
                    .uri(fast2SmsUrl)
                    .header("authorization", fast2SmsApiKey.trim())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(formBody)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Booking SMS sent. booking={} number={}", booking.getId(), number);
        } catch (RestClientResponseException exception) {
            log.warn(
                    "Failed to send booking SMS. booking={} number={} status={} body={}",
                    booking.getId(),
                    number,
                    exception.getRawStatusCode(),
                    exception.getResponseBodyAsString()
            );
        } catch (Exception exception) {
            log.warn("Failed to send booking SMS. booking={} number={} error={}", booking.getId(), number, exception.getMessage());
        }
    }

    private void sendOtpSms(String target, String otpCode, Long userId, String failureMessage) {
        if (!smsEnabled) {
            log.warn("SMS gateway is disabled. Unable to deliver OTP SMS for userId={}", userId);
            throwIfCritical(failureMessage);
            return;
        }
        if (fast2SmsApiKey == null || fast2SmsApiKey.isBlank()) {
            log.warn("Fast2SMS API key is missing. Unable to deliver OTP SMS for userId={}", userId);
            throwIfCritical(failureMessage);
            return;
        }

        String number = normalizeIndianNumber(target);
        if (number == null) {
            log.info("Skipping OTP SMS because target number is invalid. userId={}", userId);
            throwIfCritical("Enter a valid Indian mobile number to receive OTP.");
            return;
        }

        String message = "Your PulseSeats OTP is " + safe(otpCode) + ". It is valid for 10 minutes. Do not share it with anyone.";

        String formBody = "route=q"
                + "&language=english"
                + "&flash=0"
                + "&numbers=" + urlEncode(number)
                + "&message=" + urlEncode(message);

        try {
            restClient.post()
                    .uri(fast2SmsUrl)
                    .header("authorization", fast2SmsApiKey.trim())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(formBody)
                    .retrieve()
                    .toBodilessEntity();
            log.info("OTP SMS sent. userId={} number={}", userId, number);
        } catch (RestClientResponseException exception) {
            log.warn(
                    "Failed to send OTP SMS. userId={} number={} status={} body={}",
                    userId,
                    number,
                    exception.getRawStatusCode(),
                    exception.getResponseBodyAsString()
            );
            throwIfCritical(failureMessage);
        } catch (Exception exception) {
            log.warn("Failed to send OTP SMS. userId={} number={} error={}", userId, number, exception.getMessage());
            throwIfCritical(failureMessage);
        }
    }

    private void throwIfCritical(String failureMessage) {
        if (failureMessage == null || failureMessage.isBlank()) {
            return;
        }
        throw new BadRequestException(failureMessage);
    }

    private String compactSeatLabels(Booking booking) {
        List<String> labels = new ArrayList<>();
        booking.getSeats().stream()
                .map(seat -> seat.getLabel())
                .sorted()
                .forEach(labels::add);
        return String.join(", ", labels);
    }

    private String normalizeIndianNumber(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String digits = raw.replaceAll("\\D", "");
        if (digits.length() == 10) {
            return digits;
        }
        if (digits.length() == 12 && digits.startsWith("91")) {
            return digits.substring(2);
        }
        return null;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
