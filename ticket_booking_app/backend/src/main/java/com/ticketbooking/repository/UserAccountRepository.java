package com.ticketbooking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.entity.UserRole;
import com.ticketbooking.entity.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    Optional<UserAccount> findByPhoneNumber(String phoneNumber);

    Optional<UserAccount> findByEmailIgnoreCaseOrPhoneNumber(String email, String phoneNumber);

    long countByRole(UserRole role);
}
