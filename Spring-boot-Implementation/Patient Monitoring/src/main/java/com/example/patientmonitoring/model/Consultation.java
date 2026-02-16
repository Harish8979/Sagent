package com.example.patientmonitoring.model;

import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer consultationID;

    private Integer appointmentID;

    private String summary;
    private String advice;
    private String prescription;
    private String followUpDate;
}

