package com.ticketbooking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.entity.OtpChannel;
import com.ticketbooking.entity.OtpVerification;
import com.ticketbooking.entity.OtpPurpose;

public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByTargetAndChannelAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String target,
            OtpChannel channel,
            OtpPurpose purpose
    );

    void deleteByUserAccountId(Long userId);
}
