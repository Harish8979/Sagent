package com.ticketbooking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.ticketbooking.entity.AuthProvider;
import com.ticketbooking.entity.OtpChannel;
import com.ticketbooking.entity.UserAccount;
import com.ticketbooking.entity.UserRole;
import com.ticketbooking.repository.UserAccountRepository;

@Configuration
public class AdminAccountInitializer {

    private static final PasswordEncoder PASSWORD_ENCODER = new BCryptPasswordEncoder();

    @Bean
    CommandLineRunner seedAdminAccount(
            UserAccountRepository userAccountRepository,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            @Value("${app.admin.full-name}") String adminFullName
    ) {
        return args -> {
            UserAccount adminUser = userAccountRepository.findByEmailIgnoreCase(adminEmail)
                    .orElseGet(UserAccount::new);

            adminUser.setFullName(adminFullName);
            adminUser.setEmail(adminEmail);
            adminUser.setPreferredChannel(OtpChannel.EMAIL);
            adminUser.setPasswordHash(PASSWORD_ENCODER.encode(adminPassword));
            adminUser.setAuthProvider(AuthProvider.PASSWORD);
            adminUser.setRole(UserRole.ADMIN);
            adminUser.setVerified(true);

            userAccountRepository.save(adminUser);
        };
    }
}
