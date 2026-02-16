package com.example.patientmonitoring.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reportID;

    @Column(name = "generated_by")
    private Integer generatedBy;

    private String reportType;

    @Column(length = 500)
    private String fileURL;

    private LocalDateTime createdAt;
}

