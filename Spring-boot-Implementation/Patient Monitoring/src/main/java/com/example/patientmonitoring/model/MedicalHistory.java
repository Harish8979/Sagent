package com.example.patientmonitoring.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "medical_history")
@Data
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "history_id")
    private Integer historyID;

    @Column(name = "patient_id")
    private Integer patientID;

    @Column(name = "medical_condition")
    private String medicalCondition;

    @Column(name = "diagnosis_date")
    private String diagnosisDate;

    @Column(name = "details")
    private String details;
}
