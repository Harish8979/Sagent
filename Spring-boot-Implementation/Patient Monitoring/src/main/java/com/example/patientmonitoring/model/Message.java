
package com.example.patientmonitoring.model;

import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer messageID;

    private Integer senderID;
    private Integer receiverID;

    private String content;
    private String sentAt;
}
