package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment,Integer> {
}
