package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor,Integer> {
}
