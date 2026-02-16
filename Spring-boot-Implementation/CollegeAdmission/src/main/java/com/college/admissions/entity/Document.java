package com.college.admissions.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer documentId;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    // FIXED: Use String instead of Enum
    @Column(name = "document_type")
    private String documentType;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public Document() {
        this.uploadedAt = LocalDateTime.now();
    }

    public Integer getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Integer documentId) {
        this.documentId = documentId;
    }

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
