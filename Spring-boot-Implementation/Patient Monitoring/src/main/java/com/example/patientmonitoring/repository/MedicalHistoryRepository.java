package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory,Integer> {
}
