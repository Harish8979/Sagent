package com.ticketbooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ticketbooking.entity.NotificationType;
import com.ticketbooking.entity.UserNotification;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {

    @EntityGraph(attributePaths = {"userAccount"})
    List<UserNotification> findByUserAccountIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserAccountIdAndType(Long userId, NotificationType type);

    boolean existsByUserAccountIdAndTypeAndTitleAndActionLink(
            Long userId,
            NotificationType type,
            String title,
            String actionLink
    );

    void deleteByUserAccountId(Long userId);
}
