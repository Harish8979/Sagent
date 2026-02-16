package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message,Integer> {
}
