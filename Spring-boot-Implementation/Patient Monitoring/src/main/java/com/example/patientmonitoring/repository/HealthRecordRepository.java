package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.HealthRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthRecordRepository extends JpaRepository<HealthRecord,Integer> {
}
