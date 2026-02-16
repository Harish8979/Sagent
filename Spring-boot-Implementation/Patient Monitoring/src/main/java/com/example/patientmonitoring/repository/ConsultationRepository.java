package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsultationRepository extends JpaRepository<Consultation,Integer> {
}
