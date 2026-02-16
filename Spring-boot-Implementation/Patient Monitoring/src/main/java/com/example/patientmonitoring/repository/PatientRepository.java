package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Integer> {
}
