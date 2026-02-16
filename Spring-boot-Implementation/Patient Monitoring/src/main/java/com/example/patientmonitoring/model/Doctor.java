package com.example.patientmonitoring.model;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer doctorID;

    private String licenseNumber;
    private String name;

    private String specialization;
    private String phone;
    private String email;
}


