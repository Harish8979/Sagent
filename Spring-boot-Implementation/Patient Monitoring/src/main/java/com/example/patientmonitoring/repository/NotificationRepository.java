package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification,Integer> {
}
