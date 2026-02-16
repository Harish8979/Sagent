package com.example.patientmonitoring.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notificationID;

    private Integer userID;
    private String type;
    private String message;

    private String createdAt;
    private Boolean isRead;
}
