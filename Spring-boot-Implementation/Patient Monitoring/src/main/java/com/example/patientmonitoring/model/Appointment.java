package com.example.patientmonitoring.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer appointmentID;

    private Integer patientID;
    private Integer doctorID;

    private LocalDateTime dateTime;

    private String status;
    private String reason;
}
