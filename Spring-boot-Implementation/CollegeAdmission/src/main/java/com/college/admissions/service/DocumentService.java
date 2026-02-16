package com.college.admissions.service;

import com.college.admissions.entity.Document;
import com.college.admissions.repository.DocumentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public Document save(Document document) {
        return documentRepository.save(document);
    }

    public List<Document> getAll() {
        return documentRepository.findAll();
    }

    public Document getById(Integer id) {
        return documentRepository.findById(id).orElse(null);
    }
}
