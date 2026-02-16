package com.example.patientmonitoring.model;

import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer recordID;

    private Integer patientID;
    private String date;

    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;

    private Double oxygenLevel;
    private Double temperature;

    private String notes;
}
