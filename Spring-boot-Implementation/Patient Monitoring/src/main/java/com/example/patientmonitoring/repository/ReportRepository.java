package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report,Integer> {
}
